import { middlewares } from '../src'

interface IBaseContext {
  appId: string
}

describe('primitive', () => {

  const baseContext: IBaseContext = {
    appId: 'test-app-id',
  }

  const { createMiddleware, dependsOn } = middlewares<typeof baseContext>()

  test('middleware simple case', async () => {

    const aMiddleware = createMiddleware(async () => ({ a: { foo: 'foo' } }))
    const ctx = await aMiddleware(baseContext)

    expect(ctx).toStrictEqual({ appId: 'test-app-id', a: { foo: 'foo' } })
  })

  test('two middlewares simple case', async () => {

    const aMiddleware = createMiddleware(async () => ({ a: { foo: 'foo' } }))
    const bMiddleware = createMiddleware(async () => ({ b: { bar: 10 } }))
    const ctx = await aMiddleware(bMiddleware)(baseContext)

    expect(ctx).toStrictEqual({ appId: 'test-app-id', a: { foo: 'foo' }, b: { bar: 10 } })
  })

})


describe('custom merge', () => {

  const baseContext: IBaseContext = {
    appId: 'test-app-id',
  }

  //TODO custom merge

  const { createMiddleware, dependsOn } = middlewares<typeof baseContext>(customMerge)

  test('two middlewares deep merge case', async () => {

    const aMiddleware = createMiddleware(async () => ({ sharedSpace: { foo: 'foo' } }))
    const bMiddleware = createMiddleware(async () => ({ sharedSpace: { bar: 10 } }))
    const ctx = await aMiddleware(bMiddleware)(baseContext)

    expect(ctx).toStrictEqual({ appId: 'test-app-id', sharedSpace: { foo: 'foo', bar: 10 } })
  })

})

