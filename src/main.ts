import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Polygon } from 'ol/geom'
import Feature from 'ol/Feature'
import RenderFeature from 'ol/render/Feature'
import Geometry from 'ol/geom/Geometry'
import { StyleFunction } from 'ol/style/Style'
import { Style, Fill, Stroke } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { landmarksData, findFeatureById } from './helpers'

// Инициализация карты
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([37.6178, 55.7517]),
    zoom: 13
  })
})

// Слой для областей
const areasSource = new VectorSource()
const areasLayer = new VectorLayer({
  source: areasSource,
  style: ((feature: Feature<Polygon> | RenderFeature) => {
    const isHighlighted = feature.get('highlighted')
    return new Style({
      fill: new Fill({
        color: isHighlighted ? 'rgba(0, 100, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 255, 0.8)',
        width: 2
      })
    })
  }) as StyleFunction
})
map.addLayer(areasLayer)

// Добавление областей на карту
function addAreasToMap(): void {
  landmarksData.forEach(area => {
    const polygon = new Polygon([area.coords.map(coord => fromLonLat(coord))])
    const feature = new Feature({
      geometry: polygon,
      id: area.id,
      name: area.name,
      highlighted: false
    })
    areasSource.addFeature(feature)
  })
}

// Генерация списка областей
function generateAreasList(): void {
  const areasList = document.getElementById('areas-list')
  if (!areasList) return

  areasList.innerHTML = ''

  landmarksData.forEach(area => {
    const item = document.createElement('div')
    item.className = 'area-item'
    item.textContent = area.name
    item.dataset.areaId = area.id.toString()

    item.addEventListener('mouseover', () => {
      const feature = findFeatureById(areasSource, area.id)
      if (feature) {
        feature.set('highlighted', true)
        areasSource.changed()
      }
    })

    item.addEventListener('mouseout', () => {
      const feature = findFeatureById(areasSource, area.id)
      if (feature) {
        feature.set('highlighted', false)
        areasSource.changed()
      }
    })

    areasList.appendChild(item)
  })
}

// Управление видимостью слоя
const toggleAreas = document.getElementById('toggle-areas') as HTMLInputElement
toggleAreas?.addEventListener('change', function (e) {
  areasLayer.setVisible((e.target as HTMLInputElement).checked)
})

// Обработчик наведения на карте
map.on('pointermove', (e) => {
  const features = map.getFeaturesAtPixel(e.pixel)

  // Сброс подсветки
  areasSource.getFeatures().forEach(f => {
    f.set('highlighted', false)
  })

  if (features.length > 0) {
    const feature = features[0] as Feature<Polygon>
    if (feature.get('id')) {
      feature.set('highlighted', true)
    }
  }

  areasSource.changed()
})

// Инициализация
addAreasToMap()
generateAreasList()
