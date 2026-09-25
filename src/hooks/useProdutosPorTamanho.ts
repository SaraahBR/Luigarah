import { useMemo } from "react";
import { useGetProdutosPorTamanhoQuery, type Produto } from "@/store/productsApi";

type CategoriaComTamanho = "roupas" | "sapatos";

export type ProdutoComTipo = Produto & { __tipo: CategoriaComTamanho };

/**
 * Produtos com estoque em cada tamanho, no formato usado pelo filtro de tamanho das
 * listagens: { "roupas-M": [...], "sapatos-38": [...] }.
 *
 * Cada categoria custa duas requisições (produtos + tamanhos com estoque). Antes era
 * uma requisição por tamanho: 16 para roupas, 15 para sapatos e 31 na página de marcas.
 */
export function useProdutosPorTamanho(categorias: CategoriaComTamanho[]) {
  const roupas = useGetProdutosPorTamanhoQuery("roupas", { skip: !categorias.includes("roupas") });
  const sapatos = useGetProdutosPorTamanhoQuery("sapatos", { skip: !categorias.includes("sapatos") });

  const porTamanho = useMemo(() => {
    const resultado: Record<string, ProdutoComTipo[]> = {};
    const fontes: Array<[CategoriaComTamanho, Record<string, Produto[]> | undefined]> = [
      ["roupas", roupas.data],
      ["sapatos", sapatos.data],
    ];
    fontes.forEach(([categoria, dados]) => {
      Object.entries(dados ?? {}).forEach(([etiqueta, produtos]) => {
        resultado[`${categoria}-${etiqueta}`] = produtos.map((p) => ({ ...p, __tipo: categoria }));
      });
    });
    return resultado;
  }, [roupas.data, sapatos.data]);

  return { porTamanho, isLoading: roupas.isLoading || sapatos.isLoading };
}
