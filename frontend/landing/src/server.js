import express from 'express';
import { render } from '@jaredpalmer/after';
import routes from './setup/routes';
import Document from './Modules/common/Document';
import path from 'path'; 

const publicFolder = process.env.NODE_ENV === 'production' ? path.join(__dirname, '../build/public') : 'public'; 

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);
const chunks = require(process.env.RAZZLE_CHUNKS_MANIFEST);

//process.env.RAZZLE_PUBLIC_DIR 

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(publicFolder))
  .get('/*', async (req, res) => {
    try {
      const html = await render({
        req,
        res,
        routes,
        assets,
        chunks,
        document: Document,
      });
      res.send(html);
    } catch (error) {
      console.error(error);
      res.json({ message: error.message, stack: error.stack });
    }
  });

export default server;