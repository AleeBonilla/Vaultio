import { Body, Controller, Delete, Get, Headers, HttpCode, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ResourcesService } from "./resources.service";

@Controller("resources")
export class ResourcesController {
  constructor(@Inject(ResourcesService) private readonly resources: ResourcesService) {}

  @Get()
  list(@Query() query: any) {
    return this.resources.list(query);
  }

  @Get(":id")
  detail(@Headers("authorization") authorization: string | undefined, @Param("id") id: string) {
    return this.resources.detail(id, authorization);
  }

  @Post()
  create(@Headers("authorization") authorization: string | undefined, @Body() body: any) {
    return this.resources.create(authorization, body);
  }

  @Patch(":id")
  update(@Headers("authorization") authorization: string | undefined, @Param("id") id: string, @Body() body: any) {
    return this.resources.update(authorization, id, body);
  }

  @Delete(":id")
  delete(@Headers("authorization") authorization: string | undefined, @Param("id") id: string) {
    return this.resources.delete(authorization, id);
  }

  @Post(":id/download")
  @HttpCode(200)
  download(@Headers("authorization") authorization: string | undefined, @Param("id") id: string) {
    return this.resources.download(authorization, id);
  }

  @Post(":id/ratings")
  rate(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.resources.rate(authorization, id, body);
  }

  @Post(":id/save")
  @HttpCode(200)
  save(@Headers("authorization") authorization: string | undefined, @Param("id") id: string) {
    return this.resources.save(authorization, id);
  }

  @Delete(":id/save")
  unsave(@Headers("authorization") authorization: string | undefined, @Param("id") id: string) {
    return this.resources.unsave(authorization, id);
  }

  @Get(":id/comments")
  comments(@Param("id") id: string) {
    return this.resources.comments(id);
  }

  @Post(":id/comments")
  createComment(@Headers("authorization") authorization: string | undefined, @Param("id") id: string, @Body() body: any) {
    return this.resources.createComment(authorization, id, body);
  }

  @Post(":id/comments/:commentId/vote")
  voteComment(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Param("commentId") commentId: string,
    @Body() body: any,
  ) {
    return this.resources.voteComment(authorization, id, commentId, body);
  }

  @Delete(":id/comments/:commentId/vote")
  unvoteComment(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Param("commentId") commentId: string,
  ) {
    return this.resources.unvoteComment(authorization, id, commentId);
  }

  @Delete(":id/comments/:commentId")
  deleteComment(
    @Headers("authorization") authorization: string | undefined,
    @Param("id") id: string,
    @Param("commentId") commentId: string,
  ) {
    return this.resources.deleteComment(authorization, id, commentId);
  }
}
