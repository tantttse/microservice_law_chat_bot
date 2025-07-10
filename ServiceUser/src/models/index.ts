import { UserSchemas } from "./schema/user.schema";
import { AuthSchemas } from "./schema/auth.schema";

export const AllSchemas = {
  ...UserSchemas,
  ...AuthSchemas,
};
