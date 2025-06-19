import 'ol/ol.css'
import { Feature } from 'ol'
import { Polygon } from 'ol/geom'
import RenderFeature from 'ol/render/Feature'
import Geometry from 'ol/geom/Geometry'

declare module 'ol' {
  interface Feature {
    get<T = any>(key: string): T
    set(key: string, value: any, opt_silent?: boolean): void
  }
}

interface AreaData {
  id: number
  name: string
  coords: [number, number][]
}

declare module 'ol/style/Style' {
  interface Style {
    // Дополнительные определения если нужно
  }
}

declare module 'ol' {
  interface FeatureLike extends Feature<Geometry>, RenderFeature { }
}

interface Landmark {
  id: number;
  name: string;
  coords: [number, number][];
  description: string;
}
