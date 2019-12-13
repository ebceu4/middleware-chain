type extend<A, B> = A extends B ? B : never

interface contextProcessor<TContext, TExtra> {
  (context: TContext): Promise<TContext & TExtra>
}

interface middleware<TContext, TExtra> extends contextProcessor<TContext, TExtra> {
  <TContextNext, TExtraNext>(middleware: middleware<extend<TContext & TExtra, TContextNext>, TExtraNext>): middleware<TContext, TExtra & TExtraNext>
}

//type dependsOn<TMiddleware> = TMiddleware extends middleware<infer _, infer TExtra> ? TExtra : never

export const middlewares = <TBaseContext>(merge: <A, B>(a: A, b: B) => any = (a, b) => ({ ...a, ...b })) => {

  const createMiddleware = <TContext extends TBaseContext, TExtra>(handler: (context: TContext) => Promise<TExtra>): middleware<TContext, TExtra> =>
    <TContextNext, TExtraNext, TContextOrMiddleware extends TContext | middleware<extend<TContext & TExtra, TContextNext>, TExtraNext>>(contextOrMiddleware: TContextOrMiddleware)
      : any => {
      if (typeof contextOrMiddleware === 'function') {
        return createMiddleware<TContext, TExtra & TExtraNext>(ctx => handler(ctx).then(x => contextOrMiddleware(merge(ctx, x))))
      }
      else {
        return handler(contextOrMiddleware as TContext).then(x => merge(contextOrMiddleware, x))
      }
    }

  const dependsOn = <TContext extends TBaseContext, TExtra, TContextPrev, TExtraPrev>(middleware: middleware<TContextPrev, TExtraPrev>) =>
    (handler: (context: TContext & TExtraPrev) => Promise<TExtra>): middleware<TContext & TExtraPrev, TExtra> =>
      createMiddleware<TContext & TExtraPrev, TExtra>(handler)

  return { createMiddleware, dependsOn }
}


// interface IBaseContext {
//   appId: string
// }

// const { createMiddleware, dependsOn } = middlewares<IBaseContext>()


// const authMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ auth: { uid: '' } }))
// const databaseMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ db: { get: <T>(id: string): T => ({} as T), set: <T>(id: string, value: T): void => { } } }))
// const userMiddleware = createMiddleware(async (ctx: IBaseContext) => ({ user: { getUserProfile: () => ({ name: '', age: 0 }) } }))
// const userActions = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof userMiddleware>) => ({ user: { action: (): void => { ctx.user } } }))
// const userBalance = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof authMiddleware> & dependsOn<typeof databaseMiddleware>) => ({ user: { getBalance: (): number => ctx.db.get(ctx.auth.uid) } }))
// const currencies = createMiddleware(async (ctx: IBaseContext & dependsOn<typeof databaseMiddleware>) => ({ currencies: { getMainCurrency: () => ctx.db.get<{ id: string, name: string }>('MainCurrency') } }))

// // authMiddleware(databaseMiddleware)(userMiddleware)(userActions)(userBalance)(currencies)({ appId: 'app' })
// //   .then(x => {
// //     console.log('Context created')
// //     console.log(x)
// //   })

// // //middleWare1(middleware2)(ctx) => extra1 + extra2
