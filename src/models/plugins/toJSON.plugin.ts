/**
 * Applies transformation to a Mongoose schema's `toJSON` method to exclude private paths and modify output.
 * @param schema - The Mongoose schema to modify.
 */
const toJSON = (schema: any): void => {
  const { toJSON: existingToJSON } = schema.options;

  schema.options.toJSON = {
    ...existingToJSON,
    transform(doc: any, ret: any, options: any) {
      Object.keys(schema.paths).forEach((path: string) => {
        const { options: pathOptions } = schema.paths[path];
        if (pathOptions && pathOptions.private) {
          deleteAtPath(ret, path.split("."), 0);
        }
      });
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.provider_access_token;
      delete ret.provider_refresh_token;
      delete ret.provider_id;
      delete ret.provider;
      delete ret.createdAt;
      delete ret.updatedAt;
      if (existingToJSON && existingToJSON.transform) {
        return existingToJSON.transform(doc, ret, options);
      }
    },
  };
};

/**
 * Recursively deletes a property at a specified path within an object.
 * @param obj - The object to modify.
 * @param path - The path to the property as an array of keys.
 * @param index - The current index within the path array.
 */
const deleteAtPath = (obj: object, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]], path, index + 1);
};

export default toJSON;
