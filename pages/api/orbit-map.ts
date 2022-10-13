import type { NextApiRequest, NextApiResponse } from 'next'

type Nullable<T> = T | null

type BodyRel = {
    rel: string
}

type Body = {
    englishName: string,
    aroundPlanet: Nullable<BodyRel>,
    rel: string
}

type OrbitMap = {
    [body: string]: string
}

export default async function getOrbitMap (
    req: NextApiRequest,
    res: NextApiResponse<OrbitMap>
) {
    const bodyQuery = '?data=englishName,aroundPlanet,rel'
    const orbitRes = await fetch(`https://api.le-systeme-solaire.net/rest/bodies/${bodyQuery}`)
    const orbitData = await orbitRes.json()

    const orbitMap: OrbitMap = {}
    const names: Array<string> = []
    const orbitingPromises: Array<Promise<string>> = []
    orbitData.bodies.forEach((body: Body) => {
        if (body.aroundPlanet) {
            names.push(body.englishName)
            orbitingPromises.push(
                fetch(body.aroundPlanet.rel + bodyQuery)
                    .then(res => res.json())
                    .then((data: Body) => data.englishName)
            )
        } else {
            orbitMap[body.englishName] = 'Sun'
        }
    })
    const orbiting: Array<string> = await Promise.all(orbitingPromises)
    names.forEach((name: string, i: number) => {
        orbitMap[name] = orbiting[i]
    })

    res.status(200).send(orbitMap)
}
