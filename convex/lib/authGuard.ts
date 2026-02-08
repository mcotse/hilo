import type { GenericQueryCtx, GenericMutationCtx, GenericDataModel } from "convex/server";

type Ctx<DataModel extends GenericDataModel = GenericDataModel> =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>;

export async function requireAdmin<DataModel extends GenericDataModel>(ctx: Ctx<DataModel>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}
