import UniswapV2Factory from './UniswapV2Factory.json' assert { type: "json" };
import UniswapV2Router02 from './UniswapV2Router02.json' assert { type: "json" };
import WETH9 from './WETH9.json' assert { type: "json" };
import ERC20ABI from './ERC20.json' assert { type: "json" };
import UniswapPairABI from './UniswapV2Pair.json' assert { type: "json" };
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export  {
  UniswapV2Factory,
  UniswapV2Router02,
  WETH9,
  ERC20ABI,
  UniswapPairABI
}