import Categorias from './Categorias/Categorias';
import { FiSearch } from 'react-icons/fi';

const BottomBar = () => {
  return (
    <div className="bg-white border-t">
      <div className="container mx-auto flex justify-between items-center px-4 h-14">
        
        <Categorias />

        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none transition-colors pr-8 py-1"
          />
          <FiSearch className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-400" />
        </div>
        
      </div>
    </div>
  );
};

export default BottomBar;