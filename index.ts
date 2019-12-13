type extend<A, B> = A extends B ? B : never

interface contextProcessor<TContext, TExtra> {
  (context: TContext): Promise<TExtra>
}

interface middleware<TContext, TExtra> extends contextProcessor<TContext, TExtra> {
  <TContextNext, TExtraNext>(middleware: middleware<extend<TContext & TExtra, TContextNext>, TExtraNext>): middleware<TContext, TExtra & TExtraNext>
}

type dependsOn<TMiddleware> = TMiddleware extends middleware<infer _, infer TExtra> ? TExtra : never

const runMiddlewareChain = <TContext, TExtra>(initialContext: TContext, middleware: middleware<TContext, TExtra>): Promise<TContext & TExtra> =>
  Promise.resolve({} as TContext & TExtra)

const createMiddleware = <TContext, TExtra>(handler: (context: TContext) => Promise<TExtra>): middleware<TContext, TExtra> => {
  return new Proxy({} as middleware<TContext, TExtra>, {
    get: () => {
      console.log('get')

    },
    apply: () => {
      console.log('apply')
    },
  })
}

interface IBaseContext {
  appId: string
}

//const a : dependsOn<typeof userMiddleware>

const authMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ auth: { uid: '' } }))
const databaseMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ db: { get: <T>(id: string): T => ({} as T), set: <T>(id: string, value: T): void => { } } }))
const userMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ user: { getUserProfile: () => ({ name: '', age: 0 }) } }))
const userActions = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof userMiddleware>) => ({ user: { action: (): void => { ctx.user } } }))
const userBalance = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof authMiddleware> & dependsOn<typeof databaseMiddleware>) => ({ user: { getBalance: (): number => ctx.db.get(ctx.auth.uid) } }))
const currencies = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof databaseMiddleware>) => ({ currencies: { getMainCurrency: () => ctx.db.get<{ id: string, name: string }>('MainCurrency') } }))


authMiddleware(databaseMiddleware)(userMiddleware)(userActions)(userBalance)(currencies)({ appId: 'app' })
  .then(x => {
    x.db.get('')
  })

//middleWare1(middleware2)(ctx) => extra1 + extra2
