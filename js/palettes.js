// ============================================================
//  PALETAS DE CORES - DARK (55 paletas)
// ============================================================
var darkPalettes = {
  "VS Code Dark": {
    bg: "#1e1e1e", bg2: "#252526", bg3: "#2d2d2d", fg: "#d4d4d4", fg2: "#8a8a8a",
    border: "#3c3c3c", hover: "#3a3a3a", accent: "#0e639c", accentHover: "#1177bb", accentFg: "#ffffff",
    hlKeyword: "#569cd6", hlFunc: "#dcdcaa", hlStr: "#ce9178", hlNum: "#b5cea8", hlComment: "#6a9955", hlId: "#d4d4d4",
    statusBarBg: "#0e639c", err: "#f44747", info: "#4fc3f7", ok: "#81c784"
  },
  "Dracula": {
    bg: "#282a36", bg2: "#21222c", bg3: "#343746", fg: "#f8f8f2", fg2: "#6272a4",
    border: "#44475a", hover: "#44475a", accent: "#bd93f9", accentHover: "#ff79c6", accentFg: "#282a36",
    hlKeyword: "#ff79c6", hlFunc: "#50fa7b", hlStr: "#f1fa8c", hlNum: "#bd93f9", hlComment: "#6272a4", hlId: "#f8f8f2",
    statusBarBg: "#6272a4", err: "#ff5555", info: "#8be9fd", ok: "#50fa7b"
  },
  "Monokai Pro": {
    bg: "#2d2a2e", bg2: "#221f22", bg3: "#403e41", fg: "#fcfcfa", fg2: "#939293",
    border: "#403e41", hover: "#5b595c", accent: "#a9dc76", accentHover: "#ab9df2", accentFg: "#2d2a2e",
    hlKeyword: "#fc9867", hlFunc: "#a9dc76", hlStr: "#ffd866", hlNum: "#ab9df2", hlComment: "#727072", hlId: "#fcfcfa",
    statusBarBg: "#a9dc76", err: "#ff6188", info: "#78dce8", ok: "#a9dc76"
  },
  "Nord": {
    bg: "#2e3440", bg2: "#3b4252", bg3: "#434c5e", fg: "#d8dee9", fg2: "#4c566a",
    border: "#4c566a", hover: "#434c5e", accent: "#88c0d0", accentHover: "#81a1c1", accentFg: "#2e3440",
    hlKeyword: "#81a1c1", hlFunc: "#88c0d0", hlStr: "#a3be8c", hlNum: "#b48ead", hlComment: "#616e88", hlId: "#d8dee9",
    statusBarBg: "#5e81ac", err: "#bf616a", info: "#88c0d0", ok: "#a3be8c"
  },
  "One Dark Pro": {
    bg: "#282c34", bg2: "#21252b", bg3: "#333842", fg: "#abb2bf", fg2: "#636d83",
    border: "#3e4451", hover: "#3e4451", accent: "#61afef", accentHover: "#c678dd", accentFg: "#282c34",
    hlKeyword: "#c678dd", hlFunc: "#61afef", hlStr: "#98c379", hlNum: "#d19a66", hlComment: "#5c6370", hlId: "#e06c75",
    statusBarBg: "#61afef", err: "#e06c75", info: "#56b6c2", ok: "#98c379"
  },
  "Gruvbox Dark": {
    bg: "#282828", bg2: "#3c3836", bg3: "#504945", fg: "#ebdbb2", fg2: "#928374",
    border: "#504945", hover: "#665c54", accent: "#d79921", accentHover: "#fabd2f", accentFg: "#282828",
    hlKeyword: "#fb4934", hlFunc: "#b8bb26", hlStr: "#fabd2f", hlNum: "#d3869b", hlComment: "#928374", hlId: "#ebdbb2",
    statusBarBg: "#d79921", err: "#fb4934", info: "#83a598", ok: "#b8bb26"
  },
  "Solarized Dark": {
    bg: "#002b36", bg2: "#073642", bg3: "#586e75", fg: "#839496", fg2: "#586e75",
    border: "#073642", hover: "#073642", accent: "#268bd2", accentHover: "#2aa198", accentFg: "#fdf6e3",
    hlKeyword: "#859900", hlFunc: "#268bd2", hlStr: "#2aa198", hlNum: "#d33682", hlComment: "#586e75", hlId: "#93a1a1",
    statusBarBg: "#268bd2", err: "#dc322f", info: "#2aa198", ok: "#859900"
  },
  "Night Owl": {
    bg: "#011627", bg2: "#0b2942", bg3: "#1d3b53", fg: "#d6deeb", fg2: "#637777",
    border: "#1d3b53", hover: "#1d3b53", accent: "#82aaff", accentHover: "#c792ea", accentFg: "#011627",
    hlKeyword: "#c792ea", hlFunc: "#82aaff", hlStr: "#addb67", hlNum: "#f78c6c", hlComment: "#637777", hlId: "#d6deeb",
    statusBarBg: "#82aaff", err: "#ef5350", info: "#89ddff", ok: "#c3e88d"
  },
  "Material Palenight": {
    bg: "#292d3e", bg2: "#22262e", bg3: "#34323a", fg: "#a6accd", fg2: "#676e95",
    border: "#3b3e4a", hover: "#3b3e4a", accent: "#82aaff", accentHover: "#c792ea", accentFg: "#292d3e",
    hlKeyword: "#c792ea", hlFunc: "#82aaff", hlStr: "#c3e88d", hlNum: "#f78c6c", hlComment: "#676e95", hlId: "#a6accd",
    statusBarBg: "#82aaff", err: "#f07178", info: "#89ddff", ok: "#c3e88d"
  },
  "Cobalt2": {
    bg: "#132738", bg2: "#1a2a3a", bg3: "#1f3550", fg: "#ffffff", fg2: "#7285b7",
    border: "#1f3550", hover: "#1f3550", accent: "#ffc600", accentHover: "#ffffff", accentFg: "#132738",
    hlKeyword: "#ff9d00", hlFunc: "#ffc600", hlStr: "#3ad900", hlNum: "#ff628c", hlComment: "#144daa", hlId: "#ffffff",
    statusBarBg: "#ffc600", err: "#ff628c", info: "#36fcff", ok: "#3ad900"
  },
  "Ayu Dark": {
    bg: "#0f1419", bg2: "#131720", bg3: "#1c2128", fg: "#bfbdb6", fg2: "#5c6773",
    border: "#1c2128", hover: "#2d3640", accent: "#39bae6", accentHover: "#ffb454", accentFg: "#0f1419",
    hlKeyword: "#ff8f40", hlFunc: "#39bae6", hlStr: "#aad94c", hlNum: "#d2a6ff", hlComment: "#5c6773", hlId: "#bfbdb6",
    statusBarBg: "#39bae6", err: "#ff3333", info: "#39bae6", ok: "#aad94c"
  },
  "Ayu Mirage": {
    bg: "#1f2430", bg2: "#1b2030", bg3: "#272d38", fg: "#cbccc6", fg2: "#6272a4",
    border: "#272d38", hover: "#33415c", accent: "#5ccfe6", accentHover: "#ffcc66", accentFg: "#1f2430",
    hlKeyword: "#ff8f40", hlFunc: "#5ccfe6", hlStr: "#bae67e", hlNum: "#d4a6e2", hlComment: "#6272a4", hlId: "#cbccc6",
    statusBarBg: "#5ccfe6", err: "#ec5f67", info: "#5ccfe6", ok: "#bae67e"
  },
  "Tokyo Night": {
    bg: "#1a1b26", bg2: "#16161e", bg3: "#24283b", fg: "#a9b1d6", fg2: "#565f89",
    border: "#292e42", hover: "#292e42", accent: "#7aa2f7", accentHover: "#bb9af7", accentFg: "#1a1b26",
    hlKeyword: "#bb9af7", hlFunc: "#7aa2f7", hlStr: "#9ece6a", hlNum: "#ff9e64", hlComment: "#565f89", hlId: "#a9b1d6",
    statusBarBg: "#7aa2f7", err: "#f7768e", info: "#7dcfff", ok: "#9ece6a"
  },
  "Tokyo Night Storm": {
    bg: "#24283b", bg2: "#1f2335", bg3: "#292e42", fg: "#a9b1d6", fg2: "#565f89",
    border: "#292e42", hover: "#343a52", accent: "#7aa2f7", accentHover: "#bb9af7", accentFg: "#24283b",
    hlKeyword: "#bb9af7", hlFunc: "#7aa2f7", hlStr: "#9ece6a", hlNum: "#ff9e64", hlComment: "#565f89", hlId: "#a9b1d6",
    statusBarBg: "#7aa2f7", err: "#f7768e", info: "#7dcfff", ok: "#9ece6a"
  },
  "Kanagawa": {
    bg: "#16161d", bg2: "#1a1a22", bg3: "#2a2a3a", fg: "#dcd7ba", fg2: "#737aa2",
    border: "#2a2a3a", hover: "#3a3a4a", accent: "#7fb4ca", accentHover: "#957fb8", accentFg: "#16161d",
    hlKeyword: "#957fb8", hlFunc: "#7fb4ca", hlStr: "#98bc6d", hlNum: "#dca561", hlComment: "#737aa2", hlId: "#dcd7ba",
    statusBarBg: "#7fb4ca", err: "#e82424", info: "#7fb4ca", ok: "#98bc6d"
  },
  "Catppuccin Mocha": {
    bg: "#1e1e2e", bg2: "#181825", bg3: "#313244", fg: "#cdd6f4", fg2: "#6c7086",
    border: "#313244", hover: "#45475a", accent: "#89b4fa", accentHover: "#cba6f7", accentFg: "#1e1e2e",
    hlKeyword: "#cba6f7", hlFunc: "#89b4fa", hlStr: "#a6e3a1", hlNum: "#fab387", hlComment: "#6c7086", hlId: "#f38ba8",
    statusBarBg: "#89b4fa", err: "#f38ba8", info: "#89dceb", ok: "#a6e3a1"
  },
  "Catppuccin Macchiato": {
    bg: "#24273a", bg2: "#1e2030", bg3: "#363a4f", fg: "#cad3f5", fg2: "#6e738d",
    border: "#363a4f", hover: "#494d64", accent: "#8aadf4", accentHover: "#c6a0f6", accentFg: "#24273a",
    hlKeyword: "#c6a0f6", hlFunc: "#8aadf4", hlStr: "#a6da95", hlNum: "#f5a97f", hlComment: "#6e738d", hlId: "#ed8796",
    statusBarBg: "#8aadf4", err: "#ed8796", info: "#8bd5ca", ok: "#a6da95"
  },
  "Catppuccin Frappe": {
    bg: "#303446", bg2: "#292c3c", bg3: "#414559", fg: "#c6d0f5", fg2: "#737994",
    border: "#414559", hover: "#51576d", accent: "#8caaee", accentHover: "#babbf1", accentFg: "#303446",
    hlKeyword: "#babbf1", hlFunc: "#8caaee", hlStr: "#a6d189", hlNum: "#ef9f76", hlComment: "#737994", hlId: "#f4b8e4",
    statusBarBg: "#8caaee", err: "#f4b8e4", info: "#81c8be", ok: "#a6d189"
  },
  "Catppuccin Latte": {
    bg: "#eff1f5", bg2: "#e6e9ef", bg3: "#ccd0da", fg: "#4c4f69", fg2: "#8c8fa1",
    border: "#ccd0da", hover: "#bcc0cc", accent: "#1e66f5", accentHover: "#8839ef", accentFg: "#eff1f5",
    hlKeyword: "#8839ef", hlFunc: "#1e66f5", hlStr: "#40a02b", hlNum: "#fe640b", hlComment: "#8c8fa1", hlId: "#d20f39",
    statusBarBg: "#1e66f5", err: "#d20f39", info: "#179299", ok: "#40a02b"
  },
  "Rose Pine": {
    bg: "#191724", bg2: "#1f1d2e", bg3: "#26233a", fg: "#e0def4", fg2: "#6e6a86",
    border: "#26233a", hover: "#393552", accent: "#9ccfd8", accentHover: "#c4a7e7", accentFg: "#191724",
    hlKeyword: "#c4a7e7", hlFunc: "#9ccfd8", hlStr: "#f6c177", hlNum: "#eb6f92", hlComment: "#6e6a86", hlId: "#e0def4",
    statusBarBg: "#9ccfd8", err: "#eb6f92", info: "#9ccfd8", ok: "#31748f"
  },
  "Rose Pine Moon": {
    bg: "#232136", bg2: "#1e1e2e", bg3: "#2a283e", fg: "#e0def4", fg2: "#6e6a86",
    border: "#2a283e", hover: "#393552", accent: "#9ccfd8", accentHover: "#c4a7e7", accentFg: "#232136",
    hlKeyword: "#c4a7e7", hlFunc: "#9ccfd8", hlStr: "#f6c177", hlNum: "#eb6f92", hlComment: "#6e6a86", hlId: "#e0def4",
    statusBarBg: "#9ccfd8", err: "#eb6f92", info: "#9ccfd8", ok: "#31748f"
  },
  "Palenight": {
    bg: "#292d3e", bg2: "#22262e", bg3: "#34323a", fg: "#a6accd", fg2: "#676e95",
    border: "#3b3e4a", hover: "#3b3e4a", accent: "#82aaff", accentHover: "#c792ea", accentFg: "#292d3e",
    hlKeyword: "#c792ea", hlFunc: "#82aaff", hlStr: "#c3e88d", hlNum: "#f78c6c", hlComment: "#676e95", hlId: "#a6accd",
    statusBarBg: "#82aaff", err: "#f07178", info: "#89ddff", ok: "#c3e88d"
  },
  "Oceanic Next": {
    bg: "#1b2b34", bg2: "#19242c", bg3: "#253746", fg: "#c0c5ce", fg2: "#65737e",
    border: "#253746", hover: "#343d46", accent: "#6699cc", accentHover: "#c594c5", accentFg: "#1b2b34",
    hlKeyword: "#c594c5", hlFunc: "#6699cc", hlStr: "#99c794", hlNum: "#f99157", hlComment: "#65737e", hlId: "#c0c5ce",
    statusBarBg: "#6699cc", err: "#ec5f67", info: "#5fb3b3", ok: "#99c794"
  },
  "Cobalt Blue": {
    bg: "#002240", bg2: "#001a30", bg3: "#002e55", fg: "#ffffff", fg2: "#7285b7",
    border: "#002e55", hover: "#003a66", accent: "#ffc600", accentHover: "#ffffff", accentFg: "#002240",
    hlKeyword: "#ff9d00", hlFunc: "#ffc600", hlStr: "#3ad900", hlNum: "#ff628c", hlComment: "#001080", hlId: "#ffffff",
    statusBarBg: "#ffc600", err: "#ff628c", info: "#36fcff", ok: "#3ad900"
  },
  "Dracula Softer": {
    bg: "#2c2f3e", bg2: "#252837", bg3: "#3c3f58", fg: "#f8f8f2", fg2: "#6272a4",
    border: "#44475a", hover: "#44475a", accent: "#bd93f9", accentHover: "#ff79c6", accentFg: "#2c2f3e",
    hlKeyword: "#ff79c6", hlFunc: "#50fa7b", hlStr: "#f1fa8c", hlNum: "#bd93f9", hlComment: "#6272a4", hlId: "#f8f8f2",
    statusBarBg: "#6272a4", err: "#ff5555", info: "#8be9fd", ok: "#50fa7b"
  },
  "Monokai Dimmed": {
    bg: "#272822", bg2: "#1e1f1c", bg3: "#3e3d32", fg: "#f8f8f2", fg2: "#75715e",
    border: "#3e3d32", hover: "#49483e", accent: "#a6e22e", accentHover: "#fd971f", accentFg: "#272822",
    hlKeyword: "#f92672", hlFunc: "#a6e22e", hlStr: "#e6db74", hlNum: "#ae81ff", hlComment: "#75715e", hlId: "#f8f8f2",
    statusBarBg: "#a6e22e", err: "#f92672", info: "#66d9ef", ok: "#a6e22e"
  },
  "Molokai": {
    bg: "#1b1d1e", bg2: "#181a1b", bg3: "#2c2e2f", fg: "#f8f8f2", fg2: "#f92672",
    border: "#2c2e2f", hover: "#3b3d3e", accent: "#66d9ef", accentHover: "#a6e22e", accentFg: "#1b1d1e",
    hlKeyword: "#f92672", hlFunc: "#a6e22e", hlStr: "#e6db74", hlNum: "#ae81ff", hlComment: "#75715e", hlId: "#f8f8f2",
    statusBarBg: "#66d9ef", err: "#f92672", info: "#66d9ef", ok: "#a6e22e"
  },
  "Tomorrow Night": {
    bg: "#1d1f21", bg2: "#17191b", bg3: "#282b2e", fg: "#c5c8c6", fg2: "#969896",
    border: "#282b2e", hover: "#373b41", accent: "#81a2be", accentHover: "#b294bb", accentFg: "#1d1f21",
    hlKeyword: "#b294bb", hlFunc: "#81a2be", hlStr: "#b5bd68", hlNum: "#de935f", hlComment: "#969896", hlId: "#cc6666",
    statusBarBg: "#81a2be", err: "#cc6666", info: "#8abeb7", ok: "#b5bd68"
  },
  "Tomorrow Night Blue": {
    bg: "#002451", bg2: "#001d3b", bg3: "#003366", fg: "#ffffff", fg2: "#7285b7",
    border: "#003366", hover: "#004080", accent: "#bbd5f0", accentHover: "#ff9da4", accentFg: "#002451",
    hlKeyword: "#ff9da4", hlFunc: "#bbd5f0", hlStr: "#d1f1a9", hlNum: "#ffc58f", hlComment: "#7285b7", hlId: "#ffffff",
    statusBarBg: "#bbd5f0", err: "#ff9da4", info: "#99ffff", ok: "#d1f1a9"
  },
  "Tomorrow Night Bright": {
    bg: "#000000", bg2: "#0a0a0a", bg3: "#1a1a1a", fg: "#eaeaea", fg2: "#969896",
    border: "#1a1a1a", hover: "#2a2a2a", accent: "#d0d0ff", accentHover: "#ff9da4", accentFg: "#000000",
    hlKeyword: "#ff9da4", hlFunc: "#d0d0ff", hlStr: "#baffaa", hlNum: "#ffc58f", hlComment: "#969896", hlId: "#ffffff",
    statusBarBg: "#d0d0ff", err: "#ff9da4", info: "#99ffff", ok: "#baffaa"
  },
  "GitHub Dark": {
    bg: "#0d1117", bg2: "#161b22", bg3: "#21262d", fg: "#c9d1d9", fg2: "#8b949e",
    border: "#30363d", hover: "#30363d", accent: "#58a6ff", accentHover: "#bc8cff", accentFg: "#0d1117",
    hlKeyword: "#ff7b72", hlFunc: "#d2a8ff", hlStr: "#a5d6ff", hlNum: "#79c0ff", hlComment: "#8b949e", hlId: "#ffa657",
    statusBarBg: "#58a6ff", err: "#f85149", info: "#58a6ff", ok: "#3fb950"
  },
  "GitHub Dark Dimmed": {
    bg: "#22272e", bg2: "#1c2128", bg3: "#2d333b", fg: "#adbac7", fg2: "#768390",
    border: "#444c56", hover: "#444c56", accent: "#539bf5", accentHover: "#b083f0", accentFg: "#22272e",
    hlKeyword: "#f47067", hlFunc: "#b083f0", hlStr: "#96d0ff", hlNum: "#6cb6ff", hlComment: "#768390", hlId: "#e5926f",
    statusBarBg: "#539bf5", err: "#f47067", info: "#539bf5", ok: "#57ab5a"
  },
  "Candy": {
    bg: "#1a1a2e", bg2: "#16213e", bg3: "#0f3460", fg: "#eaeaea", fg2: "#a0a0a0",
    border: "#0f3460", hover: "#1a4080", accent: "#e94560", accentHover: "#ff6b6b", accentFg: "#1a1a2e",
    hlKeyword: "#e94560", hlFunc: "#0ea5e9", hlStr: "#22d3ee", hlNum: "#fbbf24", hlComment: "#64748b", hlId: "#eaeaea",
    statusBarBg: "#e94560", err: "#e94560", info: "#22d3ee", ok: "#22c55e"
  },
  "Crimson": {
    bg: "#1c1820", bg2: "#19161e", bg3: "#2b2533", fg: "#e0e0e0", fg2: "#7a7a7a",
    border: "#2b2533", hover: "#3d3545", accent: "#dc3545", accentHover: "#e74c3c", accentFg: "#1c1820",
    hlKeyword: "#dc3545", hlFunc: "#3498db", hlStr: "#2ecc71", hlNum: "#f39c12", hlComment: "#7a7a7a", hlId: "#e0e0e0",
    statusBarBg: "#dc3545", err: "#dc3545", info: "#3498db", ok: "#2ecc71"
  },
  "Deep Ocean": {
    bg: "#0b1120", bg2: "#0d1525", bg3: "#151d2e", fg: "#bac2de", fg2: "#5c6370",
    border: "#1e2638", hover: "#1e2638", accent: "#7aa2f7", accentHover: "#bb9af7", accentFg: "#0b1120",
    hlKeyword: "#c792ea", hlFunc: "#82aaff", hlStr: "#c3e88d", hlNum: "#f78c6c", hlComment: "#5c6370", hlId: "#ffcb6b",
    statusBarBg: "#7aa2f7", err: "#f07178", info: "#89ddff", ok: "#c3e88d"
  },
  "Matrix": {
    bg: "#0a0a0a", bg2: "#0d1a0d", bg3: "#1a2e1a", fg: "#00ff00", fg2: "#007700",
    border: "#1a2e1a", hover: "#003300", accent: "#00ff41", accentHover: "#39ff14", accentFg: "#0a0a0a",
    hlKeyword: "#39ff14", hlFunc: "#00ff41", hlStr: "#00ff00", hlNum: "#32cd32", hlComment: "#007700", hlId: "#00ff00",
    statusBarBg: "#00ff41", err: "#ff0000", info: "#00ff41", ok: "#39ff14"
  },
  "Moonlight": {
    bg: "#191724", bg2: "#16141f", bg3: "#262335", fg: "#e0def4", fg2: "#6e6a86",
    border: "#262335", hover: "#393552", accent: "#89b4fa", accentHover: "#c4a7e7", accentFg: "#191724",
    hlKeyword: "#c4a7e7", hlFunc: "#89b4fa", hlStr: "#f6c177", hlNum: "#ebbcba", hlComment: "#6e6a86", hlId: "#eb6f92",
    statusBarBg: "#89b4fa", err: "#eb6f92", info: "#9ccfd8", ok: "#31748f"
  },
  "Nord Frost": {
    bg: "#2e3440", bg2: "#2a2f3a", bg3: "#3b4252", fg: "#eceff4", fg2: "#616e88",
    border: "#3b4252", hover: "#434c5e", accent: "#8fbcbb", accentHover: "#88c0d0", accentFg: "#2e3440",
    hlKeyword: "#81a1c1", hlFunc: "#8fbcbb", hlStr: "#a3be8c", hlNum: "#b48ead", hlComment: "#616e88", hlId: "#eceff4",
    statusBarBg: "#8fbcbb", err: "#bf616a", info: "#88c0d0", ok: "#a3be8c"
  },
  "Proton": {
    bg: "#1c1c1c", bg2: "#262626", bg3: "#333333", fg: "#ffffff", fg2: "#808080",
    border: "#333333", hover: "#404040", accent: "#6d8aff", accentHover: "#b78aff", accentFg: "#1c1c1c",
    hlKeyword: "#b78aff", hlFunc: "#6d8aff", hlStr: "#82c785", hlNum: "#ff8080", hlComment: "#808080", hlId: "#ffffff",
    statusBarBg: "#6d8aff", err: "#ff8080", info: "#6d8aff", ok: "#82c785"
  },
  "Red": {
    bg: "#1a0a0a", bg2: "#1f0e0e", bg3: "#2d1515", fg: "#f0e0e0", fg2: "#a08080",
    border: "#3d2020", hover: "#4d2828", accent: "#ff4444", accentHover: "#ff6666", accentFg: "#1a0a0a",
    hlKeyword: "#ff4444", hlFunc: "#ff7777", hlStr: "#ffaaaa", hlNum: "#ff8888", hlComment: "#886666", hlId: "#f0e0e0",
    statusBarBg: "#ff4444", err: "#ff2222", info: "#ff6666", ok: "#88cc88"
  },
  "Green": {
    bg: "#0a1a0a", bg2: "#0e1f0e", bg3: "#152d15", fg: "#e0f0e0", fg2: "#80a080",
    border: "#203d20", hover: "#284d28", accent: "#44ff44", accentHover: "#66ff66", accentFg: "#0a1a0a",
    hlKeyword: "#44ff44", hlFunc: "#77ff77", hlStr: "#aaffaa", hlNum: "#88ff88", hlComment: "#668866", hlId: "#e0f0e0",
    statusBarBg: "#44ff44", err: "#ff4444", info: "#66ff66", ok: "#44ff44"
  },
  "Blue Moon": {
    bg: "#0a0e2a", bg2: "#0e1230", bg3: "#141a40", fg: "#d0e0ff", fg2: "#6080b0",
    border: "#1a2250", hover: "#202a60", accent: "#4488ff", accentHover: "#66aaff", accentFg: "#0a0e2a",
    hlKeyword: "#66aaff", hlFunc: "#88ccff", hlStr: "#aaddff", hlNum: "#ffaa44", hlComment: "#6080b0", hlId: "#d0e0ff",
    statusBarBg: "#4488ff", err: "#ff6666", info: "#88ccff", ok: "#88ff88"
  },
  "Plum": {
    bg: "#1e1a2e", bg2: "#181428", bg3: "#2a2440", fg: "#e0d8f0", fg2: "#8878a0",
    border: "#2a2440", hover: "#3a3450", accent: "#bb77ff", accentHover: "#dd99ff", accentFg: "#1e1a2e",
    hlKeyword: "#dd99ff", hlFunc: "#77bbff", hlStr: "#88ddaa", hlNum: "#ffaa77", hlComment: "#8878a0", hlId: "#e0d8f0",
    statusBarBg: "#bb77ff", err: "#ff6688", info: "#77bbff", ok: "#88ddaa"
  },
  "Mocha": {
    bg: "#1e1a14", bg2: "#1a1610", bg3: "#2a2518", fg: "#e8dcc8", fg2: "#a09078",
    border: "#2a2518", hover: "#3a3528", accent: "#d4a86a", accentHover: "#e8c088", accentFg: "#1e1a14",
    hlKeyword: "#d4a86a", hlFunc: "#78b8a0", hlStr: "#b8d080", hlNum: "#d08060", hlComment: "#a09078", hlId: "#e8dcc8",
    statusBarBg: "#d4a86a", err: "#d06050", info: "#78b8a0", ok: "#b8d080"
  },
  "Forest": {
    bg: "#141e14", bg2: "#101a10", bg3: "#1e2e1e", fg: "#d0e8d0", fg2: "#709070",
    border: "#1e2e1e", hover: "#2e3e2e", accent: "#5cb85c", accentHover: "#78d078", accentFg: "#141e14",
    hlKeyword: "#78d078", hlFunc: "#5cb85c", hlStr: "#a0d8a0", hlNum: "#c8b878", hlComment: "#709070", hlId: "#d0e8d0",
    statusBarBg: "#5cb85c", err: "#d85050", info: "#5cb85c", ok: "#5cb85c"
  },
  "Ocean": {
    bg: "#0e1e2e", bg2: "#0c1a28", bg3: "#162838", fg: "#d0e0f0", fg2: "#6888a8",
    border: "#162838", hover: "#203848", accent: "#3a98d8", accentHover: "#58b8f8", accentFg: "#0e1e2e",
    hlKeyword: "#58b8f8", hlFunc: "#3a98d8", hlStr: "#88d8a8", hlNum: "#f8a858", hlComment: "#6888a8", hlId: "#d0e0f0",
    statusBarBg: "#3a98d8", err: "#f85858", info: "#58b8f8", ok: "#88d8a8"
  },
  "Desert": {
    bg: "#1e1a10", bg2: "#1a1610", bg3: "#2e2818", fg: "#e8dcc0", fg2: "#a09068",
    border: "#2e2818", hover: "#3e3828", accent: "#d4a030", accentHover: "#e8c050", accentFg: "#1e1a10",
    hlKeyword: "#d4a030", hlFunc: "#60a8d0", hlStr: "#b8c870", hlNum: "#d08050", hlComment: "#a09068", hlId: "#e8dcc0",
    statusBarBg: "#d4a030", err: "#d05040", info: "#60a8d0", ok: "#b8c870"
  },
  "Arctic": {
    bg: "#e8f0f8", bg2: "#d8e8f0", bg3: "#c0d8e8", fg: "#1a2840", fg2: "#4a6888",
    border: "#b0c8d8", hover: "#a0c0d0", accent: "#2888c8", accentHover: "#1870b0", accentFg: "#e8f0f8",
    hlKeyword: "#1870b0", hlFunc: "#2888c8", hlStr: "#188860", hlNum: "#c85028", hlComment: "#4a6888", hlId: "#1a2840",
    statusBarBg: "#2888c8", err: "#d02020", info: "#2888c8", ok: "#188860"
  },
  "Crimson Dark": {
    bg: "#181012", bg2: "#140c10", bg3: "#261820", fg: "#f0d8e0", fg2: "#a07888",
    border: "#261820", hover: "#362028", accent: "#e83860", accentHover: "#ff5880", accentFg: "#181012",
    hlKeyword: "#ff5880", hlFunc: "#58b8f8", hlStr: "#88d8a8", hlNum: "#f8a858", hlComment: "#a07888", hlId: "#f0d8e0",
    statusBarBg: "#e83860", err: "#ff3030", info: "#58b8f8", ok: "#88d8a8"
  },
  "Void": {
    bg: "#080808", bg2: "#0c0c0c", bg3: "#141414", fg: "#c0c0c0", fg2: "#606060",
    border: "#1a1a1a", hover: "#222222", accent: "#7c4dff", accentHover: "#b47cff", accentFg: "#080808",
    hlKeyword: "#b47cff", hlFunc: "#7c4dff", hlStr: "#69f0ae", hlNum: "#ff8a65", hlComment: "#606060", hlId: "#c0c0c0",
    statusBarBg: "#7c4dff", err: "#ff5252", info: "#40c4ff", ok: "#69f0ae"
  },
  "Parchment": {
    bg: "#f5edd8", bg2: "#ece4cc", bg3: "#e0d8c0", fg: "#3a3228", fg2: "#887860",
    border: "#d8d0b8", hover: "#d0c8b0", accent: "#884422", accentHover: "#aa6633", accentFg: "#f5edd8",
    hlKeyword: "#884422", hlFunc: "#227788", hlStr: "#448822", hlNum: "#aa6633", hlComment: "#887860", hlId: "#3a3228",
    statusBarBg: "#884422", err: "#cc2222", info: "#227788", ok: "#448822"
  },
  "Midnight": {
    bg: "#0c1020", bg2: "#0a0e1c", bg3: "#141a30", fg: "#d0d8f0", fg2: "#6070a0",
    border: "#1a2240", hover: "#222a48", accent: "#5070d0", accentHover: "#7090f0", accentFg: "#0c1020",
    hlKeyword: "#7090f0", hlFunc: "#5070d0", hlStr: "#80c8a0", hlNum: "#f0a060", hlComment: "#6070a0", hlId: "#d0d8f0",
    statusBarBg: "#5070d0", err: "#f05050", info: "#5090e0", ok: "#80c8a0"
  },
  "Solar Flare": {
    bg: "#181008", bg2: "#140c04", bg3: "#281c10", fg: "#f8e8d0", fg2: "#a88860",
    border: "#281c10", hover: "#382c18", accent: "#e88020", accentHover: "#ff9838", accentFg: "#181008",
    hlKeyword: "#ff9838", hlFunc: "#e88020", hlStr: "#f0d070", hlNum: "#ff6040", hlComment: "#a88860", hlId: "#f8e8d0",
    statusBarBg: "#e88020", err: "#ff4040", info: "#f0c060", ok: "#80c860"
  }
};

// ============================================================
//  PALETAS DE CORES - LIGHT (55 paletas)
// ============================================================
var lightPalettes = {
  "VS Code Light": {
    bg: "#ffffff", bg2: "#f3f3f3", bg3: "#e8e8e8", fg: "#1f1f1f", fg2: "#888888",
    border: "#d8d8d8", hover: "#e0e0e0", accent: "#0078d4", accentHover: "#005a9e", accentFg: "#ffffff",
    hlKeyword: "#0033b3", hlFunc: "#795e26", hlStr: "#a31515", hlNum: "#098658", hlComment: "#008000", hlId: "#1f1f1f",
    statusBarBg: "#0078d4", err: "#d32f2f", info: "#0078d4", ok: "#2e7d32"
  },
  "GitHub Light": {
    bg: "#ffffff", bg2: "#f6f8fa", bg3: "#eaeef2", fg: "#1f2328", fg2: "#636c76",
    border: "#d0d7de", hover: "#eaeef2", accent: "#0969da", accentHover: "#0550ae", accentFg: "#ffffff",
    hlKeyword: "#cf222e", hlFunc: "#8250df", hlStr: "#0a3069", hlNum: "#0550ae", hlComment: "#6e7781", hlId: "#1f2328",
    statusBarBg: "#0969da", err: "#cf222e", info: "#0969da", ok: "#1a7f37"
  },
  "Solarized Light": {
    bg: "#fdf6e3", bg2: "#eee8d5", bg3: "#ddd6c1", fg: "#657b83", fg2: "#93a1a1",
    border: "#eee8d5", hover: "#ddd6c1", accent: "#268bd2", accentHover: "#2aa198", accentFg: "#fdf6e3",
    hlKeyword: "#859900", hlFunc: "#268bd2", hlStr: "#2aa198", hlNum: "#d33682", hlComment: "#93a1a1", hlId: "#586e75",
    statusBarBg: "#268bd2", err: "#dc322f", info: "#2aa198", ok: "#859900"
  },
  "One Light": {
    bg: "#fafafa", bg2: "#f0f0f0", bg3: "#e0e0e0", fg: "#383a42", fg2: "#a0a1a7",
    border: "#e0e0e0", hover: "#dcdcdc", accent: "#4078f2", accentHover: "#3368c9", accentFg: "#fafafa",
    hlKeyword: "#a626a4", hlFunc: "#4078f2", hlStr: "#50a14f", hlNum: "#986801", hlComment: "#a0a1a7", hlId: "#383a42",
    statusBarBg: "#4078f2", err: "#e45649", info: "#4078f2", ok: "#50a14f"
  },
  "Dracula Light": {
    bg: "#fffbeb", bg2: "#f8f4e8", bg3: "#e2deca", fg: "#1f1f1f", fg2: "#6c664b",
    border: "#e2deca", hover: "#dcd8c4", accent: "#644ac9", accentHover: "#a3144d", accentFg: "#fffbeb",
    hlKeyword: "#a3144d", hlFunc: "#14710a", hlStr: "#846e15", hlNum: "#a34d14", hlComment: "#6c664b", hlId: "#1f1f1f",
    statusBarBg: "#644ac9", err: "#cb3a2a", info: "#036a96", ok: "#14710a"
  },
  "Monokai Light": {
    bg: "#f9f8f5", bg2: "#f2f1ee", bg3: "#e8e7e4", fg: "#383a42", fg2: "#a0a1a7",
    border: "#e8e7e4", hover: "#dddcda", accent: "#a626a4", accentHover: "#4078f2", accentFg: "#f9f8f5",
    hlKeyword: "#a626a4", hlFunc: "#4078f2", hlStr: "#50a14f", hlNum: "#986801", hlComment: "#a0a1a7", hlId: "#383a42",
    statusBarBg: "#a626a4", err: "#e45649", info: "#0184bc", ok: "#50a14f"
  },
  "Atom One Light": {
    bg: "#fafafa", bg2: "#f5f5f5", bg3: "#e8e8e8", fg: "#383a42", fg2: "#a0a1a7",
    border: "#e8e8e8", hover: "#dcdbd9", accent: "#4078f2", accentHover: "#3170d1", accentFg: "#fafafa",
    hlKeyword: "#a626a4", hlFunc: "#4078f2", hlStr: "#50a14f", hlNum: "#986801", hlComment: "#a0a1a7", hlId: "#383a42",
    statusBarBg: "#4078f2", err: "#e45649", info: "#0184bc", ok: "#50a14f"
  },
  "PaperColor Light": {
    bg: "#eeeeee", bg2: "#e8e8e8", bg3: "#dcdcdc", fg: "#444444", fg2: "#888888",
    border: "#d0d0d0", hover: "#c8c8c8", accent: "#0087af", accentHover: "#005f87", accentFg: "#eeeeee",
    hlKeyword: "#af0000", hlFunc: "#0087af", hlStr: "#008700", hlNum: "#d75f00", hlComment: "#878787", hlId: "#444444",
    statusBarBg: "#0087af", err: "#af0000", info: "#0087af", ok: "#008700"
  },
  "Nord Light": {
    bg: "#eceff4", bg2: "#e5e9f0", bg3: "#d8dee9", fg: "#2e3440", fg2: "#4c566a",
    border: "#d8dee9", hover: "#d0d8e4", accent: "#5e81ac", accentHover: "#81a1c1", accentFg: "#eceff4",
    hlKeyword: "#81a1c1", hlFunc: "#5e81ac", hlStr: "#a3be8c", hlNum: "#b48ead", hlComment: "#7b88a1", hlId: "#2e3440",
    statusBarBg: "#5e81ac", err: "#bf616a", info: "#5e81ac", ok: "#a3be8c"
  },
  "Tomorrow Light": {
    bg: "#ffffff", bg2: "#f7f7f7", bg3: "#e8e8e8", fg: "#4d4d4d", fg2: "#8e908c",
    border: "#d6d6d6", hover: "#cccccc", accent: "#4271ae", accentHover: "#3060a0", accentFg: "#ffffff",
    hlKeyword: "#c82829", hlFunc: "#4271ae", hlStr: "#718c00", hlNum: "#e8a838", hlComment: "#8e908c", hlId: "#4d4d4d",
    statusBarBg: "#4271ae", err: "#c82829", info: "#3e999f", ok: "#718c00"
  },
  "GitHub Light Classic": {
    bg: "#ffffff", bg2: "#f6f8fa", bg3: "#e1e4e8", fg: "#24292e", fg2: "#6a737d",
    border: "#e1e4e8", hover: "#d1d5da", accent: "#0366d6", accentHover: "#0256b9", accentFg: "#ffffff",
    hlKeyword: "#d73a49", hlFunc: "#6f42c1", hlStr: "#032f62", hlNum: "#005cc5", hlComment: "#6a737d", hlId: "#24292e",
    statusBarBg: "#0366d6", err: "#d73a49", info: "#0366d6", ok: "#22863a"
  },
  "Quiet Light": {
    bg: "#f7f7f7", bg2: "#f0f0f0", bg3: "#e4e4e4", fg: "#696969", fg2: "#999999",
    border: "#dcdcdc", hover: "#d4d4d4", accent: "#3366cc", accentHover: "#224499", accentFg: "#f7f7f7",
    hlKeyword: "#ca9826", hlFunc: "#6987c5", hlStr: "#6987c5", hlNum: "#ca9826", hlComment: "#999999", hlId: "#696969",
    statusBarBg: "#3366cc", err: "#c0392b", info: "#3366cc", ok: "#27ae60"
  },
  "Cream": {
    bg: "#fefbf3", bg2: "#f9f5e8", bg3: "#efe8d8", fg: "#4a3f35", fg2: "#8a7f72",
    border: "#e8dcc8", hover: "#e0d4c0", accent: "#b5651d", accentHover: "#d4831f", accentFg: "#fefbf3",
    hlKeyword: "#b5651d", hlFunc: "#2e6b8a", hlStr: "#5b8c5a", hlNum: "#c97b2a", hlComment: "#8a7f72", hlId: "#4a3f35",
    statusBarBg: "#b5651d", err: "#c0392b", info: "#2e6b8a", ok: "#5b8c5a"
  },
  "Cloud": {
    bg: "#f0f4f8", bg2: "#e6edf3", bg3: "#dce4eb", fg: "#243040", fg2: "#607890",
    border: "#c8d6e0", hover: "#b8c8d8", accent: "#3a7bd5", accentHover: "#2a6bc5", accentFg: "#f0f4f8",
    hlKeyword: "#d63384", hlFunc: "#3a7bd5", hlStr: "#198754", hlNum: "#fd7e14", hlComment: "#607890", hlId: "#243040",
    statusBarBg: "#3a7bd5", err: "#dc3545", info: "#3a7bd5", ok: "#198754"
  },
  "Latte": {
    bg: "#eff1f5", bg2: "#e6e9ef", bg3: "#ccd0da", fg: "#4c4f69", fg2: "#8c8fa1",
    border: "#ccd0da", hover: "#bcc0cc", accent: "#1e66f5", accentHover: "#8839ef", accentFg: "#eff1f5",
    hlKeyword: "#8839ef", hlFunc: "#1e66f5", hlStr: "#40a02b", hlNum: "#fe640b", hlComment: "#8c8fa1", hlId: "#4c4f69",
    statusBarBg: "#1e66f5", err: "#d20f39", info: "#179299", ok: "#40a02b"
  },
  "Mocha Light": {
    bg: "#fdf8f0", bg2: "#f5efe5", bg3: "#e8dfd0", fg: "#3c3836", fg2: "#8a7f72",
    border: "#e0d8c8", hover: "#d8d0c0", accent: "#b16286", accentHover: "#d65d0e", accentFg: "#fdf8f0",
    hlKeyword: "#b16286", hlFunc: "#458588", hlStr: "#98971a", hlNum: "#d65d0e", hlComment: "#8a7f72", hlId: "#3c3836",
    statusBarBg: "#b16286", err: "#cc241d", info: "#458588", ok: "#98971a"
  },
  "Blush": {
    bg: "#faf0f0", bg2: "#f5e8e8", bg3: "#ead8d8", fg: "#4a3030", fg2: "#a08080",
    border: "#e0c8c8", hover: "#d8c0c0", accent: "#c44860", accentHover: "#e05878", accentFg: "#faf0f0",
    hlKeyword: "#c44860", hlFunc: "#3080b0", hlStr: "#40a060", hlNum: "#d08020", hlComment: "#a08080", hlId: "#4a3030",
    statusBarBg: "#c44860", err: "#d02030", info: "#3080b0", ok: "#40a060"
  },
  "Mint": {
    bg: "#f0faf5", bg2: "#e5f5ec", bg3: "#d5ede0", fg: "#1a3a2a", fg2: "#5a8a70",
    border: "#c0dcd0", hover: "#b0d0c0", accent: "#10a060", accentHover: "#089050", accentFg: "#f0faf5",
    hlKeyword: "#d03070", hlFunc: "#10a060", hlStr: "#2090d0", hlNum: "#d08020", hlComment: "#5a8a70", hlId: "#1a3a2a",
    statusBarBg: "#10a060", err: "#d02030", info: "#2090d0", ok: "#10a060"
  },
  "Lavender": {
    bg: "#f5f0fa", bg2: "#eee8f5", bg3: "#e0d8eb", fg: "#302050", fg2: "#8060a0",
    border: "#d8d0e5", hover: "#d0c8e0", accent: "#8060c0", accentHover: "#6040a0", accentFg: "#f5f0fa",
    hlKeyword: "#a040c0", hlFunc: "#6060d0", hlStr: "#208060", hlNum: "#d06020", hlComment: "#8060a0", hlId: "#302050",
    statusBarBg: "#8060c0", err: "#d02040", info: "#6060d0", ok: "#208060"
  },
  "Sunrise": {
    bg: "#fff8f0", bg2: "#fff0e5", bg3: "#ffe8d5", fg: "#3a2810", fg2: "#a08060",
    border: "#f0dcc0", hover: "#e8d4b8", accent: "#e07020", accentHover: "#c05010", accentFg: "#fff8f0",
    hlKeyword: "#c03060", hlFunc: "#2080b0", hlStr: "#40a040", hlNum: "#e07020", hlComment: "#a08060", hlId: "#3a2810",
    statusBarBg: "#e07020", err: "#d02020", info: "#2080b0", ok: "#40a040"
  },
  "Cotton Candy": {
    bg: "#fdf0f8", bg2: "#f8e8f0", bg3: "#f0d8e5", fg: "#4a2040", fg2: "#a07090",
    border: "#e8c8d8", hover: "#e0c0d0", accent: "#d04090", accentHover: "#e060a8", accentFg: "#fdf0f8",
    hlKeyword: "#d04090", hlFunc: "#3080c0", hlStr: "#40a060", hlNum: "#e08040", hlComment: "#a07090", hlId: "#4a2040",
    statusBarBg: "#d04090", err: "#d02040", info: "#3080c0", ok: "#40a060"
  },
  "Vanilla": {
    bg: "#fffef5", bg2: "#faf8e8", bg3: "#f0eed8", fg: "#3a3820", fg2: "#8a8860",
    border: "#e8e6c8", hover: "#e0dec0", accent: "#a09020", accentHover: "#c0b030", accentFg: "#fffef5",
    hlKeyword: "#b04080", hlFunc: "#2070a0", hlStr: "#309030", hlNum: "#c08020", hlComment: "#8a8860", hlId: "#3a3820",
    statusBarBg: "#a09020", err: "#c02020", info: "#2070a0", ok: "#309030"
  },
  "Ocean Light": {
    bg: "#f5f8fc", bg2: "#e8f0f8", bg3: "#d8e8f0", fg: "#1a2840", fg2: "#507090",
    border: "#c8d8e8", hover: "#b8d0e0", accent: "#1070c0", accentHover: "#0860b0", accentFg: "#f5f8fc",
    hlKeyword: "#c03060", hlFunc: "#1070c0", hlStr: "#208060", hlNum: "#d06020", hlComment: "#507090", hlId: "#1a2840",
    statusBarBg: "#1070c0", err: "#d02030", info: "#1070c0", ok: "#208060"
  },
  "Spring": {
    bg: "#f5fdf5", bg2: "#e8f8e8", bg3: "#d5f0d5", fg: "#1a3020", fg2: "#508060",
    border: "#c0e0c0", hover: "#b0d8b0", accent: "#20a040", accentHover: "#108030", accentFg: "#f5fdf5",
    hlKeyword: "#c03060", hlFunc: "#20a040", hlStr: "#2070c0", hlNum: "#c08020", hlComment: "#508060", hlId: "#1a3020",
    statusBarBg: "#20a040", err: "#d02030", info: "#2070c0", ok: "#20a040"
  },
  "Autumn": {
    bg: "#fdf8f0", bg2: "#f5f0e5", bg3: "#e8e0d0", fg: "#3a2810", fg2: "#8a7860",
    border: "#e0d8c0", hover: "#d8d0b8", accent: "#b06020", accentHover: "#c07030", accentFg: "#fdf8f0",
    hlKeyword: "#a03060", hlFunc: "#2060a0", hlStr: "#308030", hlNum: "#b06020", hlComment: "#8a7860", hlId: "#3a2810",
    statusBarBg: "#b06020", err: "#c02020", info: "#2060a0", ok: "#308030"
  },
  "Winter": {
    bg: "#f5f8fc", bg2: "#e8f0f8", bg3: "#d8e8f4", fg: "#1a2840", fg2: "#507090",
    border: "#c8d8ea", hover: "#b8d0e2", accent: "#3080c0", accentHover: "#2070b0", accentFg: "#f5f8fc",
    hlKeyword: "#8030a0", hlFunc: "#3080c0", hlStr: "#208060", hlNum: "#c06020", hlComment: "#507090", hlId: "#1a2840",
    statusBarBg: "#3080c0", err: "#d02040", info: "#3080c0", ok: "#208060"
  },
  "Honey": {
    bg: "#fffcf0", bg2: "#f8f4e0", bg3: "#efe8d0", fg: "#3a3010", fg2: "#8a8060",
    border: "#e8e0c0", hover: "#e0d8b8", accent: "#c0a010", accentHover: "#d0b020", accentFg: "#fffcf0",
    hlKeyword: "#b03060", hlFunc: "#2070a0", hlStr: "#309030", hlNum: "#c0a010", hlComment: "#8a8060", hlId: "#3a3010",
    statusBarBg: "#c0a010", err: "#c02020", info: "#2070a0", ok: "#309030"
  },
  "Peach": {
    bg: "#fff5f0", bg2: "#ffe8e0", bg3: "#f8d8c8", fg: "#3a2010", fg2: "#a07060",
    border: "#f0c8b0", hover: "#e8c0a8", accent: "#d06040", accentHover: "#e08060", accentFg: "#fff5f0",
    hlKeyword: "#b03060", hlFunc: "#2070a0", hlStr: "#309030", hlNum: "#d06040", hlComment: "#a07060", hlId: "#3a2010",
    statusBarBg: "#d06040", err: "#c02020", info: "#2070a0", ok: "#309030"
  },
  "Sky": {
    bg: "#f0f8ff", bg2: "#e0f0ff", bg3: "#d0e8ff", fg: "#102040", fg2: "#4070a0",
    border: "#c0d8f0", hover: "#b0d0e8", accent: "#2080e0", accentHover: "#1070d0", accentFg: "#f0f8ff",
    hlKeyword: "#a020c0", hlFunc: "#2080e0", hlStr: "#209040", hlNum: "#d06020", hlComment: "#4070a0", hlId: "#102040",
    statusBarBg: "#2080e0", err: "#d02040", info: "#2080e0", ok: "#209040"
  },
  "Rose": {
    bg: "#fff5f5", bg2: "#ffe8e8", bg3: "#f8d8d8", fg: "#3a1020", fg2: "#a06070",
    border: "#f0c8c8", hover: "#e8c0c0", accent: "#d04060", accentHover: "#e06080", accentFg: "#fff5f5",
    hlKeyword: "#a02060", hlFunc: "#2070b0", hlStr: "#208040", hlNum: "#c06030", hlComment: "#a06070", hlId: "#3a1020",
    statusBarBg: "#d04060", err: "#c02030", info: "#2070b0", ok: "#208040"
  },
  "Lilac": {
    bg: "#f8f0fc", bg2: "#f0e8f8", bg3: "#e8d8f0", fg: "#2a1040", fg2: "#8060a0",
    border: "#e0d0e8", hover: "#d8c8e0", accent: "#9040c0", accentHover: "#b060e0", accentFg: "#f8f0fc",
    hlKeyword: "#b040c0", hlFunc: "#3070d0", hlStr: "#209060", hlNum: "#d06030", hlComment: "#8060a0", hlId: "#2a1040",
    statusBarBg: "#9040c0", err: "#c02040", info: "#3070d0", ok: "#209060"
  },
  "Pearl": {
    bg: "#f8f8fc", bg2: "#f0f0f8", bg3: "#e8e8f0", fg: "#2a2840", fg2: "#706890",
    border: "#d8d8e8", hover: "#d0d0e0", accent: "#6060c0", accentHover: "#8080e0", accentFg: "#f8f8fc",
    hlKeyword: "#a040c0", hlFunc: "#4040d0", hlStr: "#209060", hlNum: "#d06030", hlComment: "#706890", hlId: "#2a2840",
    statusBarBg: "#6060c0", err: "#c02040", info: "#4040d0", ok: "#209060"
  },
  "Mist": {
    bg: "#f5f8f8", bg2: "#e8f0f0", bg3: "#d8e8e8", fg: "#1a3030", fg2: "#508080",
    border: "#c8d8d8", hover: "#b8d0d0", accent: "#2080a0", accentHover: "#107090", accentFg: "#f5f8f8",
    hlKeyword: "#a03080", hlFunc: "#2080a0", hlStr: "#208040", hlNum: "#c06020", hlComment: "#508080", hlId: "#1a3030",
    statusBarBg: "#2080a0", err: "#c02040", info: "#2080a0", ok: "#208040"
  },
  "Almond": {
    bg: "#faf5f0", bg2: "#f5ede5", bg3: "#e8ddd0", fg: "#3a3020", fg2: "#8a7a60",
    border: "#e0d5c5", hover: "#d8cdc0", accent: "#b07040", accentHover: "#c08050", accentFg: "#faf5f0",
    hlKeyword: "#a04060", hlFunc: "#2060a0", hlStr: "#308030", hlNum: "#b07040", hlComment: "#8a7a60", hlId: "#3a3020",
    statusBarBg: "#b07040", err: "#c02030", info: "#2060a0", ok: "#308030"
  },
  "Ivory": {
    bg: "#fffff8", bg2: "#f8f8f0", bg3: "#f0f0e5", fg: "#2a2a10", fg2: "#7a7a60",
    border: "#e8e8d0", hover: "#e0e0c8", accent: "#80a020", accentHover: "#90b030", accentFg: "#fffff8",
    hlKeyword: "#a03080", hlFunc: "#3060c0", hlStr: "#208040", hlNum: "#c07020", hlComment: "#7a7a60", hlId: "#2a2a10",
    statusBarBg: "#80a020", err: "#c02030", info: "#3060c0", ok: "#208040"
  },
  "Chalk": {
    bg: "#f5f5f0", bg2: "#eaeae5", bg3: "#e0e0d8", fg: "#3a3a30", fg2: "#8a8a80",
    border: "#d8d8d0", hover: "#d0d0c8", accent: "#60a0c0", accentHover: "#5090b0", accentFg: "#f5f5f0",
    hlKeyword: "#c04080", hlFunc: "#60a0c0", hlStr: "#40a040", hlNum: "#c08030", hlComment: "#8a8a80", hlId: "#3a3a30",
    statusBarBg: "#60a0c0", err: "#c03040", info: "#60a0c0", ok: "#40a040"
  },
  "Feather": {
    bg: "#fafcfe", bg2: "#f0f4f8", bg3: "#e4eaf0", fg: "#1a2840", fg2: "#5878a0",
    border: "#d4dce8", hover: "#c8d4e0", accent: "#3880d0", accentHover: "#2870c0", accentFg: "#fafcfe",
    hlKeyword: "#a03080", hlFunc: "#3880d0", hlStr: "#289050", hlNum: "#d06020", hlComment: "#5878a0", hlId: "#1a2840",
    statusBarBg: "#3880d0", err: "#d02040", info: "#3880d0", ok: "#289050"
  },
  "Sand": {
    bg: "#fdf8f0", bg2: "#f5f0e8", bg3: "#e8e0d0", fg: "#3a3020", fg2: "#8a7860",
    border: "#e0d5c0", hover: "#d8cda8", accent: "#a08040", accentHover: "#b09050", accentFg: "#fdf8f0",
    hlKeyword: "#b04060", hlFunc: "#3068a0", hlStr: "#308030", hlNum: "#a08040", hlComment: "#8a7860", hlId: "#3a3020",
    statusBarBg: "#a08040", err: "#c02030", info: "#3068a0", ok: "#308030"
  },
  "Stone": {
    bg: "#f5f5f5", bg2: "#ebebeb", bg3: "#e0e0e0", fg: "#303030", fg2: "#787878",
    border: "#d0d0d0", hover: "#c8c8c8", accent: "#5080a0", accentHover: "#407090", accentFg: "#f5f5f5",
    hlKeyword: "#a03070", hlFunc: "#5080a0", hlStr: "#308030", hlNum: "#b07030", hlComment: "#787878", hlId: "#303030",
    statusBarBg: "#5080a0", err: "#c02030", info: "#5080a0", ok: "#308030"
  },
  "Cherry": {
    bg: "#fff5f5", bg2: "#ffe8e8", bg3: "#f8d5d5", fg: "#3a1020", fg2: "#a06070",
    border: "#f0c5c5", hover: "#e8b8b8", accent: "#c03060", accentHover: "#d04070", accentFg: "#fff5f5",
    hlKeyword: "#a02060", hlFunc: "#2070a0", hlStr: "#208040", hlNum: "#c06030", hlComment: "#a06070", hlId: "#3a1020",
    statusBarBg: "#c03060", err: "#c02030", info: "#2070a0", ok: "#208040"
  },
  "Sakura": {
    bg: "#fef8fa", bg2: "#fdf0f5", bg3: "#f8e5ee", fg: "#3a2030", fg2: "#a07080",
    border: "#f0d5e0", hover: "#e8ccd8", accent: "#d05080", accentHover: "#e06090", accentFg: "#fef8fa",
    hlKeyword: "#c03070", hlFunc: "#3070b0", hlStr: "#208040", hlNum: "#c07030", hlComment: "#a07080", hlId: "#3a2030",
    statusBarBg: "#d05080", err: "#c02040", info: "#3070b0", ok: "#208040"
  },
  "Magnolia": {
    bg: "#fafafa", bg2: "#f5f5f5", bg3: "#ebebeb", fg: "#3a3a3a", fg2: "#888888",
    border: "#e0e0e0", hover: "#d8d8d8", accent: "#9c27b0", accentHover: "#7b1fa2", accentFg: "#fafafa",
    hlKeyword: "#7b1fa2", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#888888", hlId: "#3a3a3a",
    statusBarBg: "#9c27b0", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Daisy": {
    bg: "#fefdf5", bg2: "#faf8e8", bg3: "#f2f0d8", fg: "#3a3818", fg2: "#8a8860",
    border: "#e8e5c0", hover: "#e0deb8", accent: "#f9a825", accentHover: "#f57f17", accentFg: "#3a3818",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#8a8860", hlId: "#3a3818",
    statusBarBg: "#f9a825", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Chalkboard": {
    bg: "#f0f0e8", bg2: "#e8e8e0", bg3: "#d8d8d0", fg: "#2a2a20", fg2: "#7a7a70",
    border: "#c8c8c0", hover: "#c0c0b8", accent: "#5c6bc0", accentHover: "#3f51b5", accentFg: "#f0f0e8",
    hlKeyword: "#7b1fa2", hlFunc: "#1976d2", hlStr: "#388e3c", hlNum: "#f57c00", hlComment: "#7a7a70", hlId: "#2a2a20",
    statusBarBg: "#5c6bc0", err: "#d32f2f", info: "#1976d2", ok: "#388e3c"
  },
  "Linen": {
    bg: "#faf5f0", bg2: "#f5f0ea", bg3: "#ebe5dd", fg: "#3a3028", fg2: "#8a7a68",
    border: "#ddd5c8", hover: "#d5cfc0", accent: "#8d6e63", accentHover: "#6d4c41", accentFg: "#faf5f0",
    hlKeyword: "#6d4c41", hlFunc: "#1976d2", hlStr: "#388e3c", hlNum: "#ef6c00", hlComment: "#8a7a68", hlId: "#3a3028",
    statusBarBg: "#8d6e63", err: "#c62828", info: "#1976d2", ok: "#388e3c"
  },
  "Coral": {
    bg: "#fff5f2", bg2: "#ffe8e2", bg3: "#f8dbd2", fg: "#3a2018", fg2: "#a07060",
    border: "#f0c8bc", hover: "#e8c0b4", accent: "#ff7043", accentHover: "#f4511e", accentFg: "#fff5f2",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#a07060", hlId: "#3a2018",
    statusBarBg: "#ff7043", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Pistachio": {
    bg: "#f5faf0", bg2: "#eaf5e5", bg3: "#d8ecd0", fg: "#203018", fg2: "#608050",
    border: "#c5d8b8", hover: "#b8d0a8", accent: "#7cb342", accentHover: "#558b2f", accentFg: "#f5faf0",
    hlKeyword: "#ad1457", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#608050", hlId: "#203018",
    statusBarBg: "#7cb342", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Powder Blue": {
    bg: "#f0f5fa", bg2: "#e5ecf5", bg3: "#d5e2ed", fg: "#1a2840", fg2: "#507090",
    border: "#c0d5e8", hover: "#b0cce0", accent: "#42a5f5", accentHover: "#1e88e5", accentFg: "#1a2840",
    hlKeyword: "#7b1fa2", hlFunc: "#1976d2", hlStr: "#388e3c", hlNum: "#f57c00", hlComment: "#507090", hlId: "#1a2840",
    statusBarBg: "#42a5f5", err: "#d32f2f", info: "#1976d2", ok: "#388e3c"
  },
  "Strawberry": {
    bg: "#fef5f5", bg2: "#fdead", bg3: "#f8ddd8", fg: "#3a1828", fg2: "#a06070",
    border: "#f0c5c0", hover: "#e8b8b0", accent: "#ef5350", accentHover: "#e53935", accentFg: "#fef5f5",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#a06070", hlId: "#3a1828",
    statusBarBg: "#ef5350", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Canary": {
    bg: "#fffff0", bg2: "#fcf8e0", bg3: "#f5f0d0", fg: "#2a2810", fg2: "#8a8860",
    border: "#e8e0b8", hover: "#e0d8b0", accent: "#ffd600", accentHover: "#ffab00", accentFg: "#2a2810",
    hlKeyword: "#d50000", hlFunc: "#2962ff", hlStr: "#1b5e20", hlNum: "#e65100", hlComment: "#8a8860", hlId: "#2a2810",
    statusBarBg: "#ffd600", err: "#d50000", info: "#2962ff", ok: "#1b5e20"
  },
  "Tangerine": {
    bg: "#fffaf0", bg2: "#fff3e0", bg3: "#ffe8cc", fg: "#3a2810", fg2: "#a08060",
    border: "#f5dcc0", hover: "#f0d4b0", accent: "#ff9800", accentHover: "#f57c00", accentFg: "#3a2810",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#a08060", hlId: "#3a2810",
    statusBarBg: "#ff9800", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Robin Egg": {
    bg: "#f0faf8", bg2: "#e2f5f0", bg3: "#d0ece5", fg: "#103028", fg2: "#508878",
    border: "#c0ddd5", hover: "#b0d5cc", accent: "#26a69a", accentHover: "#00897b", accentFg: "#103028",
    hlKeyword: "#ad1457", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#508878", hlId: "#103028",
    statusBarBg: "#26a69a", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Periwinkle": {
    bg: "#f5f0fa", bg2: "#ece5f5", bg3: "#ddd5eb", fg: "#2a2040", fg2: "#7868a0",
    border: "#d0c5e0", hover: "#c8bcd8", accent: "#7e57c2", accentHover: "#5e35b1", accentFg: "#f5f0fa",
    hlKeyword: "#ab47bc", hlFunc: "#42a5f5", hlStr: "#66bb6a", hlNum: "#ffa726", hlComment: "#7868a0", hlId: "#2a2040",
    statusBarBg: "#7e57c2", err: "#ef5350", info: "#42a5f5", ok: "#66bb6a"
  },
  "Butter": {
    bg: "#fffde8", bg2: "#fff8d0", bg3: "#f5f0b8", fg: "#302a10", fg2: "#8a8060",
    border: "#e8e0a0", hover: "#e0d898", accent: "#c0ca33", accentHover: "#9e9d24", accentFg: "#302a10",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#8a8060", hlId: "#302a10",
    statusBarBg: "#c0ca33", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Ceramic": {
    bg: "#f8f6f2", bg2: "#f0ece5", bg3: "#e5e0d8", fg: "#3a3530", fg2: "#888078",
    border: "#d8d2c8", hover: "#d0cac0", accent: "#78909c", accentHover: "#546e7a", accentFg: "#f8f6f2",
    hlKeyword: "#5c6bc0", hlFunc: "#0277bd", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#888078", hlId: "#3a3530",
    statusBarBg: "#78909c", err: "#c62828", info: "#0277bd", ok: "#2e7d32"
  },
  "Wheat": {
    bg: "#faf5eb", bg2: "#f5efe0", bg3: "#e8e0d0", fg: "#3a3020", fg2: "#8a7860",
    border: "#e0d5c0", hover: "#d8cdb8", accent: "#8d6e63", accentHover: "#6d4c41", accentFg: "#faf5eb",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#8a7860", hlId: "#3a3020",
    statusBarBg: "#8d6e63", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Lemon": {
    bg: "#fffff8", bg2: "#fefde0", bg3: "#f8f8c8", fg: "#2a2a10", fg2: "#7a7a60",
    border: "#e8e8b0", hover: "#e0e0a8", accent: "#cddc39", accentHover: "#afb42b", accentFg: "#2a2a10",
    hlKeyword: "#d50000", hlFunc: "#2962ff", hlStr: "#1b5e20", hlNum: "#e65100", hlComment: "#7a7a60", hlId: "#2a2a10",
    statusBarBg: "#cddc39", err: "#d50000", info: "#2962ff", ok: "#1b5e20"
  },
  "Eggshell": {
    bg: "#f8f5f0", bg2: "#f2ede5", bg3: "#e8e2d8", fg: "#35302a", fg2: "#857a6a",
    border: "#d8d0c5", hover: "#d0c8bd", accent: "#607d8b", accentHover: "#455a64", accentFg: "#f8f5f0",
    hlKeyword: "#7b1fa2", hlFunc: "#1976d2", hlStr: "#388e3c", hlNum: "#f57c00", hlComment: "#857a6a", hlId: "#35302a",
    statusBarBg: "#607d8b", err: "#d32f2f", info: "#1976d2", ok: "#388e3c"
  },
  "Flax": {
    bg: "#faf8f0", bg2: "#f5f0e5", bg3: "#ebe5d5", fg: "#3a3520", fg2: "#8a8060",
    border: "#e0d8c0", hover: "#d8d0b8", accent: "#afb42b", accentHover: "#9e9d24", accentFg: "#3a3520",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#8a8060", hlId: "#3a3520",
    statusBarBg: "#afb42b", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Jade": {
    bg: "#f0faf5", bg2: "#e5f5ec", bg3: "#d5ede0", fg: "#1a3a28", fg2: "#5a8a68",
    border: "#c0dcc8", hover: "#b5d4be", accent: "#4caf50", accentHover: "#388e3c", accentFg: "#f0faf5",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#ef6c00", hlComment: "#5a8a68", hlId: "#1a3a28",
    statusBarBg: "#4caf50", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  },
  "Salmon": {
    bg: "#fef5f2", bg2: "#fceee8", bg3: "#f5e0d8", fg: "#3a2218", fg2: "#a07068",
    border: "#f0d0c5", hover: "#e8c8bc", accent: "#ff8a65", accentHover: "#f4511e", accentFg: "#fef5f2",
    hlKeyword: "#c62828", hlFunc: "#1565c0", hlStr: "#2e7d32", hlNum: "#e65100", hlComment: "#a07068", hlId: "#3a2218",
    statusBarBg: "#ff8a65", err: "#c62828", info: "#1565c0", ok: "#2e7d32"
  }
};

