export const initialState = {
  graph: {
    data: null,
    loadError: null,
    dimensions: { width: 0, height: 0 },
    nodeRelSize: 2,
    linkWidthScale: 0.8,
    linkDistance: 50,
    chargeStrength: -50,
    useCustomShapes: true,
    showNodeLabels: true,
    labelScale: 1,
    labelTextColor: '#ffffff',
    linkColorNormal: '#ffffff',
    linkColorHighlight: '#3b82f6',
    visibleTypes: {},
    searchQuery: '',
    searchTypeFilter: '',
    searchTypeOpen: false,
    dataReady: false,
  },
  selection: {
    node: null,
    relatedNodeIds: new Set(),
    mdContent: '',
    mdLoading: false,
  },
  ui: {
    showControls: false,
    graphBgColor: '#000000',
  },
  routing: {
    currentPath: '/',
  },
  context7: {
    hintsByNode: {},
    loadingNodeId: null,
    error: null,
  },
}

function graphReducer(state, action) {
  switch (action.type) {
    case 'GRAPH/LOAD_START':
      return {
        ...state,
        loadError: null,
        data: null,
        dataReady: false,
      }
    case 'GRAPH/LOAD_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        loadError: null,
      }
    case 'GRAPH/LOAD_ERROR':
      return {
        ...state,
        loadError: action.payload.error || 'Error al cargar el grafo.',
      }
    case 'GRAPH/SET_DIMENSIONS':
      return {
        ...state,
        dimensions: action.payload,
      }
    case 'GRAPH/SET_DATA_READY':
      return {
        ...state,
        dataReady: !!action.payload,
      }
    case 'GRAPH/SET_NODE_REL_SIZE':
      return {
        ...state,
        nodeRelSize: action.payload,
      }
    case 'GRAPH/SET_LINK_WIDTH_SCALE':
      return {
        ...state,
        linkWidthScale: action.payload,
      }
    case 'GRAPH/SET_LINK_DISTANCE':
      return {
        ...state,
        linkDistance: action.payload,
      }
    case 'GRAPH/SET_CHARGE_STRENGTH':
      return {
        ...state,
        chargeStrength: action.payload,
      }
    case 'GRAPH/SET_SHOW_NODE_LABELS':
      return {
        ...state,
        showNodeLabels: !!action.payload,
      }
    case 'GRAPH/SET_LABEL_SCALE':
      return {
        ...state,
        labelScale: action.payload,
      }
    case 'GRAPH/SET_LABEL_TEXT_COLOR':
      return {
        ...state,
        labelTextColor: action.payload,
      }
    case 'GRAPH/SET_LINK_COLORS':
      return {
        ...state,
        linkColorNormal: action.payload.normal ?? state.linkColorNormal,
        linkColorHighlight: action.payload.highlight ?? state.linkColorHighlight,
      }
    case 'GRAPH/SET_VISIBLE_TYPES':
      return {
        ...state,
        visibleTypes: action.payload,
      }
    case 'GRAPH/SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_FILTER':
      return {
        ...state,
        searchTypeFilter: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_OPEN':
      return {
        ...state,
        searchTypeOpen: !!action.payload,
      }
    default:
      return state
  }
}

function selectionReducer(state, action) {
  switch (action.type) {
    case 'SELECTION/SET_NODE':
      return {
        ...state,
        node: action.payload.node,
      }
    case 'SELECTION/CLEAR':
      return {
        ...state,
        node: null,
        relatedNodeIds: new Set(),
        mdContent: '',
        mdLoading: false,
      }
    case 'SELECTION/SET_RELATED_IDS':
      return {
        ...state,
        relatedNodeIds: action.payload,
      }
    case 'SELECTION/LOAD_MD_START':
      return {
        ...state,
        mdLoading: true,
      }
    case 'SELECTION/LOAD_MD_SUCCESS':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload,
      }
    case 'SELECTION/LOAD_MD_ERROR':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload || '*No se pudo cargar el archivo.*',
      }
    default:
      return state
  }
}

function uiReducer(state, action) {
  switch (action.type) {
    case 'UI/SET_SHOW_CONTROLS':
      return {
        ...state,
        showControls: !!action.payload,
      }
    case 'UI/SET_GRAPH_BG_COLOR':
      return {
        ...state,
        graphBgColor: action.payload,
      }
    default:
      return state
  }
}

function routingReducer(state, action) {
  switch (action.type) {
    case 'ROUTING/NAVIGATE':
      return {
        ...state,
        currentPath: action.payload,
      }
    default:
      return state
  }
}

function context7Reducer(state, action) {
  switch (action.type) {
    case 'CONTEXT7/LOAD_HINTS_START':
      return {
        ...state,
        loadingNodeId: action.payload,
        error: null,
      }
    case 'CONTEXT7/LOAD_HINTS_SUCCESS':
      return {
        ...state,
        loadingNodeId: null,
        hintsByNode: {
          ...state.hintsByNode,
          [action.payload.nodeId]: action.payload.hints,
        },
      }
    case 'CONTEXT7/LOAD_HINTS_ERROR':
      return {
        ...state,
        loadingNodeId: null,
        error: action.payload || 'Error al cargar datos de Context7.',
      }
    default:
      return state
  }
}

export function rootReducer(state, action) {
  return {
    graph: graphReducer(state.graph, action),
    selection: selectionReducer(state.selection, action),
    ui: uiReducer(state.ui, action),
    routing: routingReducer(state.routing, action),
    context7: context7Reducer(state.context7, action),
  }
}

export const initialState = {
  graph: {
    data: null,
    loadError: null,
    dimensions: { width: 0, height: 0 },
    nodeRelSize: 2,
    linkWidthScale: 0.8,
    linkDistance: 50,
    chargeStrength: -50,
    useCustomShapes: true,
    showNodeLabels: true,
    labelScale: 1,
    labelTextColor: '#ffffff',
    linkColorNormal: '#646464',
    linkColorHighlight: '#3b82f6',
    visibleTypes: {},
    searchQuery: '',
    searchTypeFilter: '',
    searchTypeOpen: false,
    dataReady: false,
  },
  selection: {
    node: null,
    relatedNodeIds: new Set(),
    mdContent: '',
    mdLoading: false,
  },
  ui: {
    showControls: false,
    graphBgColor: '#000000',
  },
  routing: {
    currentPath: '/',
  },
  context7: {
    hintsByNode: {},
    loadingNodeId: null,
    error: null,
  },
}

function graphReducer(state, action) {
  switch (action.type) {
    case 'GRAPH/LOAD_START':
      return {
        ...state,
        loadError: null,
        data: null,
        dataReady: false,
      }
    case 'GRAPH/LOAD_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        loadError: null,
      }
    case 'GRAPH/LOAD_ERROR':
      return {
        ...state,
        loadError: action.payload.error || 'Error al cargar el grafo.',
      }
    case 'GRAPH/SET_DIMENSIONS':
      return {
        ...state,
        dimensions: action.payload,
      }
    case 'GRAPH/SET_DATA_READY':
      return {
        ...state,
        dataReady: !!action.payload,
      }
    case 'GRAPH/SET_NODE_REL_SIZE':
      return {
        ...state,
        nodeRelSize: action.payload,
      }
    case 'GRAPH/SET_LINK_WIDTH_SCALE':
      return {
        ...state,
        linkWidthScale: action.payload,
      }
    case 'GRAPH/SET_LINK_DISTANCE':
      return {
        ...state,
        linkDistance: action.payload,
      }
    case 'GRAPH/SET_CHARGE_STRENGTH':
      return {
        ...state,
        chargeStrength: action.payload,
      }
    case 'GRAPH/SET_SHOW_NODE_LABELS':
      return {
        ...state,
        showNodeLabels: !!action.payload,
      }
    case 'GRAPH/SET_LABEL_SCALE':
      return {
        ...state,
        labelScale: action.payload,
      }
    case 'GRAPH/SET_LABEL_TEXT_COLOR':
      return {
        ...state,
        labelTextColor: action.payload,
      }
    case 'GRAPH/SET_LINK_COLORS':
      return {
        ...state,
        linkColorNormal: action.payload.normal ?? state.linkColorNormal,
        linkColorHighlight: action.payload.highlight ?? state.linkColorHighlight,
      }
    case 'GRAPH/SET_VISIBLE_TYPES':
      return {
        ...state,
        visibleTypes: action.payload,
      }
    case 'GRAPH/SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_FILTER':
      return {
        ...state,
        searchTypeFilter: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_OPEN':
      return {
        ...state,
        searchTypeOpen: !!action.payload,
      }
    default:
      return state
  }
}

function selectionReducer(state, action) {
  switch (action.type) {
    case 'SELECTION/SET_NODE':
      return {
        ...state,
        node: action.payload.node,
      }
    case 'SELECTION/CLEAR':
      return {
        ...state,
        node: null,
        relatedNodeIds: new Set(),
        mdContent: '',
        mdLoading: false,
      }
    case 'SELECTION/SET_RELATED_IDS':
      return {
        ...state,
        relatedNodeIds: action.payload,
      }
    case 'SELECTION/LOAD_MD_START':
      return {
        ...state,
        mdLoading: true,
      }
    case 'SELECTION/LOAD_MD_SUCCESS':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload,
      }
    case 'SELECTION/LOAD_MD_ERROR':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload || '*No se pudo cargar el archivo.*',
      }
    default:
      return state
  }
}

function uiReducer(state, action) {
  switch (action.type) {
    case 'UI/SET_SHOW_CONTROLS':
      return {
        ...state,
        showControls: !!action.payload,
      }
    case 'UI/SET_GRAPH_BG_COLOR':
      return {
        ...state,
        graphBgColor: action.payload,
      }
    default:
      return state
  }
}

function routingReducer(state, action) {
  switch (action.type) {
    case 'ROUTING/NAVIGATE':
      return {
        ...state,
        currentPath: action.payload,
      }
    default:
      return state
  }
}

function context7Reducer(state, action) {
  switch (action.type) {
    case 'CONTEXT7/LOAD_HINTS_START':
      return {
        ...state,
        loadingNodeId: action.payload,
        error: null,
      }
    case 'CONTEXT7/LOAD_HINTS_SUCCESS':
      return {
        ...state,
        loadingNodeId: null,
        hintsByNode: {
          ...state.hintsByNode,
          [action.payload.nodeId]: action.payload.hints,
        },
      }
    case 'CONTEXT7/LOAD_HINTS_ERROR':
      return {
        ...state,
        loadingNodeId: null,
        error: action.payload || 'Error al cargar datos de Context7.',
      }
    default:
      return state
  }
}

export function rootReducer(state, action) {
  return {
    graph: graphReducer(state.graph, action),
    selection: selectionReducer(state.selection, action),
    ui: uiReducer(state.ui, action),
    routing: routingReducer(state.routing, action),
    context7: context7Reducer(state.context7, action),
  }
}

export const initialState = {
  graph: {
    data: null,
    loadError: null,
    dimensions: { width: 0, height: 0 },
    nodeRelSize: 2,
    linkWidthScale: 0.8,
    linkDistance: 50,
    chargeStrength: -50,
    useCustomShapes: true,
    showNodeLabels: true,
    labelScale: 1,
    labelTextColor: '#ffffff',
    linkColorNormal: '#646464',
    linkColorHighlight: '#3b82f6',
    visibleTypes: {},
    searchQuery: '',
    searchTypeFilter: '',
    searchTypeOpen: false,
    dataReady: false,
  },
  selection: {
    node: null,
    relatedNodeIds: new Set(),
    mdContent: '',
    mdLoading: false,
  },
  ui: {
    showControls: false,
    graphBgColor: '#000000',
  },
  routing: {
    currentPath: '/',
  },
  context7: {
    hintsByNode: {},
    loadingNodeId: null,
    error: null,
  },
}

function graphReducer(state, action) {
  switch (action.type) {
    case 'GRAPH/LOAD_START':
      return {
        ...state,
        loadError: null,
        data: null,
        dataReady: false,
      }
    case 'GRAPH/LOAD_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        loadError: null,
      }
    case 'GRAPH/LOAD_ERROR':
      return {
        ...state,
        loadError: action.payload.error || 'Error al cargar el grafo.',
      }
    case 'GRAPH/SET_DIMENSIONS':
      return {
        ...state,
        dimensions: action.payload,
      }
    case 'GRAPH/SET_DATA_READY':
      return {
        ...state,
        dataReady: !!action.payload,
      }
    case 'GRAPH/SET_NODE_REL_SIZE':
      return {
        ...state,
        nodeRelSize: action.payload,
      }
    case 'GRAPH/SET_LINK_WIDTH_SCALE':
      return {
        ...state,
        linkWidthScale: action.payload,
      }
    case 'GRAPH/SET_LINK_DISTANCE':
      return {
        ...state,
        linkDistance: action.payload,
      }
    case 'GRAPH/SET_CHARGE_STRENGTH':
      return {
        ...state,
        chargeStrength: action.payload,
      }
    case 'GRAPH/SET_SHOW_NODE_LABELS':
      return {
        ...state,
        showNodeLabels: !!action.payload,
      }
    case 'GRAPH/SET_LABEL_SCALE':
      return {
        ...state,
        labelScale: action.payload,
      }
    case 'GRAPH/SET_LABEL_TEXT_COLOR':
      return {
        ...state,
        labelTextColor: action.payload,
      }
    case 'GRAPH/SET_LINK_COLORS':
      return {
        ...state,
        linkColorNormal: action.payload.normal ?? state.linkColorNormal,
        linkColorHighlight: action.payload.highlight ?? state.linkColorHighlight,
      }
    case 'GRAPH/SET_VISIBLE_TYPES':
      return {
        ...state,
        visibleTypes: action.payload,
      }
    case 'GRAPH/SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_FILTER':
      return {
        ...state,
        searchTypeFilter: action.payload,
      }
    case 'GRAPH/SET_SEARCH_TYPE_OPEN':
      return {
        ...state,
        searchTypeOpen: !!action.payload,
      }
    default:
      return state
  }
}

function selectionReducer(state, action) {
  switch (action.type) {
    case 'SELECTION/SET_NODE':
      return {
        ...state,
        node: action.payload.node,
      }
    case 'SELECTION/CLEAR':
      return {
        ...state,
        node: null,
        relatedNodeIds: new Set(),
        mdContent: '',
        mdLoading: false,
      }
    case 'SELECTION/SET_RELATED_IDS':
      return {
        ...state,
        relatedNodeIds: action.payload,
      }
    case 'SELECTION/LOAD_MD_START':
      return {
        ...state,
        mdLoading: true,
      }
    case 'SELECTION/LOAD_MD_SUCCESS':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload,
      }
    case 'SELECTION/LOAD_MD_ERROR':
      return {
        ...state,
        mdLoading: false,
        mdContent: action.payload || '*No se pudo cargar el archivo.*',
      }
    default:
      return state
  }
}

function uiReducer(state, action) {
  switch (action.type) {
    case 'UI/SET_SHOW_CONTROLS':
      return {
        ...state,
        showControls: !!action.payload,
      }
    case 'UI/SET_GRAPH_BG_COLOR':
      return {
        ...state,
        graphBgColor: action.payload,
      }
    default:
      return state
  }
}

function routingReducer(state, action) {
  switch (action.type) {
    case 'ROUTING/NAVIGATE':
      return {
        ...state,
        currentPath: action.payload,
      }
    default:
      return state
  }
}

function context7Reducer(state, action) {
  switch (action.type) {
    case 'CONTEXT7/LOAD_HINTS_START':
      return {
        ...state,
        loadingNodeId: action.payload,
        error: null,
      }
    case 'CONTEXT7/LOAD_HINTS_SUCCESS':
      return {
        ...state,
        loadingNodeId: null,
        hintsByNode: {
          ...state.hintsByNode,
          [action.payload.nodeId]: action.payload.hints,
        },
      }
    case 'CONTEXT7/LOAD_HINTS_ERROR':
      return {
        ...state,
        loadingNodeId: null,
        error: action.payload || 'Error al cargar datos de Context7.',
      }
    default:
      return state
  }
}

export function rootReducer(state, action) {
  return {
    graph: graphReducer(state.graph, action),
    selection: selectionReducer(state.selection, action),
    ui: uiReducer(state.ui, action),
    routing: routingReducer(state.routing, action),
    context7: context7Reducer(state.context7, action),
  }
}

