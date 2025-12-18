export const ignore = [
  // ===== Version Control =====
  ".git",
  ".gitignore",
  ".gitattributes",
  ".svn",
  ".hg",

  // ===== Node / JavaScript =====
  "node_modules",
  "bower_components",
  "jspm_packages",
  ".pnpm-store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",

  // ===== Python =====
  "__pycache__",
  "*.pyc",
  "*.pyo",
  "*.pyd",
  ".pytest_cache",
  ".mypy_cache",
  ".venv",
  "venv",

  // ===== Java / JVM =====
  "target",
  "out",
  ".gradle",
  ".mvn",
  ".idea/*/libraries",
  "*.class",

  // ===== C / C++ =====
  "build",
  "cmake-build*",
  "*.o",
  "*.obj",
  "*.exe",
  "*.dll",
  "*.so",
  "*.dylib",

  // ===== Rust =====
  "target",

  // ===== Go =====
  "bin",
  "*.exe",

  // ===== PHP / Composer =====
  "vendor",

  // ===== .NET / C# =====
  "bin",
  "obj",
  "*.pdb",

  // ===== Mobile =====
  "android/app/build",
  "ios/DerivedData",
  "*.xcworkspace",
  "*.xcuserstate",

  // ===== Web Frameworks =====
  "dist",
  "build",
  ".next",
  ".nuxt",
  "public/build",
  ".parcel-cache",
  ".vite",
  ".svelte-kit",

  // ===== Tool Caches =====
  ".cache",
  ".turbo",
  ".eslintcache",
  ".stylelintcache",

  // ===== OS Metadata =====
  ".DS_Store",
  "Thumbs.db",
  "desktop.ini",

  // ===== Environment / Secrets =====
  ".env",
  ".env.*",
  "*.secret",
  "*.key",
  "*.pem",
  "*.p12",

  // ===== Logs / Dump Files =====
  "*.log",
  "*.tmp",
  "*.temp",
  "*.bak",
  "*.swp",
  "*.swo",
  "*.dump",
  "*.stackdump",

  // ===== Databases =====
  "*.db",
  "*.sqlite",
  "*.sqlite3",
  "*.mdb",

  // ===== Docker =====
  ".dockerignore",
  "Dockerfile.*",

  // ===== Archives =====
  "*.zip",
  "*.tar",
  "*.tar.gz",
  "*.rar",
  "*.7z",

  // ===== Images (optional—if not needed for hashing) =====
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.webp",
  "*.ico",

  // ===== Large media files =====
  "*.mp4",
  "*.mp3",
  "*.wav",
  "*.mov",

  // ===== Misc Backup Noise =====
  "*~",
  "~$*",
  "*.orig",
];
