import invariant from 'tiny-invariant'

export type TransformerResult<TResult> =
  | TResult
  | null // input should be omitted
  | undefined // execute next transformer

export type Transformer<TData extends any[], TResult> = (...data: TData) => TransformerResult<TResult>

export function applyTransformers<TData extends any[]>(...data: TData) {
  return function <TResult>(transformers: Transformer<TData, TResult>[]): TResult | null {
    for (const transformer of transformers) {
      const result = transformer(...data)
      if (result !== undefined) {
        return result
      }
    }

    invariant(false, `No transformer match for data.`)
  }
}
