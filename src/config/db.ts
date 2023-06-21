import configs from "./configs";

interface IDBConnection {
  url: string;
  options: object;
}

const connectDB: IDBConnection = {
  url: configs.mongoose.url,
  options: configs.mongoose.options,
};

export default connectDB;
