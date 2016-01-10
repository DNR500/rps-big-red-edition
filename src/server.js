import * as server from './node/httpapp';
import config from './config';

server.start(config.connectionPort);