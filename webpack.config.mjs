import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  entry: './src/main.ts',
  output: {
    filename: 'bundle.js',
    // Use CWD to avoid __dirname in ESM on Windows
    path: path.resolve(process.cwd(), 'dist'),
    clean: true,
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(process.cwd(), 'index.ejs'),
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(process.cwd(), 'public'),
          to: path.resolve(process.cwd(), 'dist'),
          globOptions: { ignore: ['**/index.html'] },
        },
      ],
    }),
  ],
  devServer: {
    static: { directory: path.join(process.cwd(), 'public') },
    port: 5173,
    hot: true,
  },
};
