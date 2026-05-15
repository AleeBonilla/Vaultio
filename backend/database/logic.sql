-- ============================================================
-- VAULTIO — Lógica de Base de Datos (Funciones, Triggers, SPs)
-- Archivo: logic.sql
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- FUNCIONES DE TRIGGER
-- ────────────────────────────────────────────────────────────

-- 1. Auto-update de updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER trg_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- 2. Incrementar downloads_count al registrar descarga
CREATE OR REPLACE FUNCTION trg_increment_downloads()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE resources
        SET downloads_count = downloads_count + 1
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_downloads_count
    AFTER INSERT ON user_downloads
    FOR EACH ROW EXECUTE FUNCTION trg_increment_downloads();


-- 3. Prevenir que un usuario califique su propio recurso
CREATE OR REPLACE FUNCTION trg_prevent_self_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id = (SELECT user_id FROM resources WHERE id = NEW.resource_id) THEN
        RAISE EXCEPTION 'Un usuario no puede calificar su propio recurso.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ratings_no_self
    BEFORE INSERT OR UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION trg_prevent_self_rating();


-- 4. Prevenir que un usuario se reporte a sí mismo
CREATE OR REPLACE FUNCTION trg_prevent_self_report()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reporter_id IS NOT NULL
       AND NEW.reported_user_id IS NOT NULL
       AND NEW.reporter_id = NEW.reported_user_id THEN
        RAISE EXCEPTION 'Un usuario no puede reportarse a sí mismo.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reports_no_self
    BEFORE INSERT ON reports
    FOR EACH ROW EXECUTE FUNCTION trg_prevent_self_report();


-- 5. Auditoría genérica
CREATE OR REPLACE FUNCTION trg_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(table_name, record_id, action, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Auditoría en tablas críticas
CREATE TRIGGER trg_audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log();

CREATE TRIGGER trg_audit_resources
    AFTER INSERT OR UPDATE OR DELETE ON resources
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log();

CREATE TRIGGER trg_audit_reports
    AFTER INSERT OR UPDATE OR DELETE ON reports
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log();

CREATE TRIGGER trg_audit_comments
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log();

CREATE TRIGGER trg_audit_ratings
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION trg_audit_log();


-- ────────────────────────────────────────────────────────────
-- STORED FUNCTIONS (Lógica de Negocio)
-- ────────────────────────────────────────────────────────────

-- 1. Promedio de rating de un recurso
CREATE OR REPLACE FUNCTION fn_resource_avg_rating(p_resource_id UUID)
RETURNS NUMERIC(3,2) AS $$
    SELECT COALESCE(AVG(stars)::NUMERIC(3,2), 0)
    FROM ratings
    WHERE resource_id = p_resource_id;
$$ LANGUAGE sql STABLE;


-- 2. Recalcular reputación de un usuario
CREATE OR REPLACE FUNCTION fn_recalc_reputation(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_score INTEGER;
BEGIN
    SELECT COALESCE(
        SUM(
            CASE
                WHEN sub.avg_stars >= 4 THEN 3
                WHEN sub.avg_stars >= 3 THEN 1
                ELSE 0
            END
        ), 0)
    INTO v_score
    FROM (
        SELECT res.id, AVG(rat.stars) AS avg_stars
        FROM resources res
        JOIN ratings rat ON rat.resource_id = res.id
        WHERE res.user_id = p_user_id
          AND res.is_active = TRUE
        GROUP BY res.id
    ) sub;

    UPDATE users
        SET reputation_score = v_score
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- 3. Soft-delete en cascada para un recurso
CREATE OR REPLACE FUNCTION fn_soft_delete_resource(p_resource_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE resources
        SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_resource_id;

    UPDATE comments
        SET is_active = FALSE, updated_at = NOW()
    WHERE resource_id = p_resource_id;
END;
$$ LANGUAGE plpgsql;


-- 4. Estadísticas completas de un recurso
CREATE OR REPLACE FUNCTION fn_resource_stats(p_resource_id UUID)
RETURNS TABLE (
    avg_rating      NUMERIC(3,2),
    total_ratings   BIGINT,
    total_comments  BIGINT,
    total_downloads BIGINT,
    total_saves     BIGINT
) AS $$
    SELECT
        COALESCE(AVG(rat.stars)::NUMERIC(3,2), 0)  AS avg_rating,
        COUNT(DISTINCT rat.id)                       AS total_ratings,
        (SELECT COUNT(*) FROM comments c
            WHERE c.resource_id = p_resource_id AND c.is_active = TRUE),
        (SELECT COUNT(*) FROM user_downloads d
            WHERE d.resource_id = p_resource_id),
        (SELECT COUNT(*) FROM saved_resources s
            WHERE s.resource_id = p_resource_id)
    FROM ratings rat
    WHERE rat.resource_id = p_resource_id;
$$ LANGUAGE sql STABLE;
