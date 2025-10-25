import { useEffect } from "react";
import { FiX, FiPackage, FiTag, FiDollarSign, FiBox, FiLayers, FiFlag, FiUser } from "react-icons/fi";
import { ProdutoDTO, IdentidadeDTO } from "@/hooks/api/types";
import Image from "next/image";
import { useBuscarProdutoComIdentidadePorIdQuery } from "@/hooks/api/identidadesApi";
import { useBuscarPadraoDoProdutoQuery } from "@/hooks/api/produtosApi";
import { parseArrayField } from "@/lib/arrayUtils";

interface ProductDetailsModalProps {
  product: ProdutoDTO | null;
  onClose: () => void;
}

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  // Buscar produto com identidade populada
  const { data: produtoComIdentidade } = useBuscarProdutoComIdentidadePorIdQuery(
    product?.id || 0,
    { skip: !product?.id }
  );

  // Buscar padrão de tamanho do produto
  const { data: padraoDoProduto } = useBuscarPadraoDoProdutoQuery(
    product?.id || 0,
    { skip: !product?.id }
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);
  
  if (!product) return null;

  // Processar arrays de imagens e destaques
  const imagens = parseArrayField(product.imagens);
  const destaques = parseArrayField(product.destaques);

  // Usar identidade do produto buscado ou a que vem do produto original (se houver)
  const identidade = produtoComIdentidade?.identidade || product.identidade;
  
  // Usar padrão do produto com identidade (vem completo), senão do endpoint de padrão, senão do produto original
  const padrao = produtoComIdentidade?.padrao !== undefined 
    ? produtoComIdentidade.padrao 
    : (padraoDoProduto !== undefined ? padraoDoProduto : product.padrao);

  const getPadraoLabel = (padrao: string | null | undefined) => {
    if (!padrao || padrao === null || padrao === undefined) return "Não definido";
    if (padrao === "usa") return "USA";
    if (padrao === "br") return "Brasil";
    return padrao.toUpperCase();
  };

  const getIdentidadeLabel = (identidade: IdentidadeDTO | null | undefined) => {
    if (!identidade || !identidade.nome) return "Não definida";
    return identidade.nome;
  };

  const getIdentidadeCodigo = (identidade: IdentidadeDTO | null | undefined) => {
    if (!identidade || !identidade.codigo) return "N/A";
    return identidade.codigo;
  };

  const getIdentidadeId = (identidade: IdentidadeDTO | null | undefined) => {
    if (!identidade || !identidade.id) return "N/A";
    return `#${identidade.id}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Detalhes do Produto
            </h2>
            <p className="text-sm text-gray-400 mt-1">ID: #{product.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiX className="text-2xl text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Imagens do Produto */}
            {(product.imagem || product.imagemHover || (product.imagens && product.imagens.length > 0)) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiPackage className="text-xl" />
                  Imagens
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.imagem && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image 
                        src={product.imagem} 
                        alt="Imagem Principal" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 text-center">
                        Principal
                      </div>
                    </div>
                  )}
                  {product.imagemHover && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image 
                        src={product.imagemHover} 
                        alt="Imagem Hover" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 text-center">
                        Hover
                      </div>
                    </div>
                  )}
                  {imagens.length > 0 && imagens.map((img: string, idx: number) => {
                    // Validar se a URL é válida antes de renderizar
                    if (!img || img.trim() === '') return null;
                    
                    return (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image 
                          src={img} 
                          alt={`Galeria ${idx + 1}`} 
                          fill 
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 text-center">
                          Galeria {idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Informações Básicas */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiTag className="text-xl" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">ID</p>
                  <p className="text-gray-900 font-semibold">#{product.id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Título</p>
                  <p className="text-gray-900 font-semibold">{product.titulo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Subtítulo</p>
                  <p className="text-gray-900">{product.subtitulo || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Autor/Designer</p>
                  <p className="text-gray-900">{product.autor || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-1">
                    <FiDollarSign className="text-sm" />
                    Preço
                  </p>
                  <p className="text-gray-900 font-bold text-lg">{formatBRL(product.preco)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Categoria</p>
                  <p className="text-gray-900 capitalize font-semibold">
                    {product.categoria || "N/A"}
                  </p>
                </div>
              </div>
              {product.descricao && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 font-medium mb-1">Descrição</p>
                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {product.descricao}
                  </p>
                </div>
              )}
            </div>

            {/* Sistema de Tamanhos */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiLayers className="text-xl text-blue-600" />
                Sistema de Tamanhos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-1">
                    <FiFlag className="text-sm" />
                    Padrão de Tamanho
                  </p>
                  <p className="text-gray-900 font-semibold bg-white px-3 py-2 rounded-lg border border-blue-200">
                    {getPadraoLabel(padrao)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Dimensões Físicas</p>
                  <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-blue-200">
                    {product.dimensao || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {/* Identidade */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="text-xl text-purple-600" />
                Identidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Nome</p>
                  <p className="text-gray-900 font-semibold bg-white px-3 py-2 rounded-lg border border-purple-200">
                    {getIdentidadeLabel(identidade)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Código</p>
                  <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-purple-200">
                    {getIdentidadeCodigo(identidade)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">ID</p>
                  <p className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-purple-200">
                    {getIdentidadeId(identidade)}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalhes Adicionais */}
            {(product.composicao || (product.destaques && product.destaques.length > 0)) && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBox className="text-xl text-green-600" />
                  Detalhes Adicionais
                </h3>
                {product.composicao && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-1">Composição</p>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border border-green-200">
                      {product.composicao}
                    </p>
                  </div>
                )}
                {destaques.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Destaques</p>
                    <div className="flex flex-wrap gap-2">
                      {destaques.map((destaque: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm text-gray-900"
                        >
                          {destaque}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modelo (se existir) */}
            {product.modelo && Object.keys(product.modelo).length > 0 && (
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelo (Dados Técnicos)</h3>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <pre className="text-sm text-gray-900 overflow-x-auto">
                    {JSON.stringify(product.modelo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
