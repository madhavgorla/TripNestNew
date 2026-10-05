import React, { useState } from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  Key,
  Globe,
  ArrowRight,
  Code2,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Cpu,
  RefreshCw,
  FolderGit2,
  ExternalLink,
  Lock,
  Sparkles,
  Download,
  FileArchive,
} from 'lucide-react';
import { apiClient, getActiveApiBaseUrl, setActiveApiBaseUrl } from '../../services/api';

export const SpringBootArchitectureHub: React.FC = () => {
  const [activeBaseUrl, setActiveUrl] = useState<string>(getActiveApiBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState<string>(
    getActiveApiBaseUrl() === '/api' ? 'http://localhost:8080/api' : getActiveApiBaseUrl()
  );
  const [selectedFile, setSelectedFile] = useState<string>('SecurityConfig.java');
  const [copied, setCopied] = useState<boolean>(false);
  const [testEndpoint, setTestEndpoint] = useState<string>('/reviews');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: number | null;
    statusText?: string;
    durationMs: number | null;
    data: any;
    error?: string;
  } | null>(null);

  const handleSwitchBackend = (url: string) => {
    setActiveApiBaseUrl(url);
    setActiveUrl(url);
    setTestResult(null);
  };

  const handleRunAxiosTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      let res;
      if (testMethod === 'GET') {
        res = await apiClient.get(testEndpoint);
      } else {
        res = await apiClient.post(testEndpoint, {
          targetId: 'rome',
          targetName: 'Rome',
          targetType: 'destination',
          rating: 5,
          title: 'Axios Spring Boot Integration Test',
          comment: 'Verified seamless REST call from React Vite to Spring Boot backend.',
          travelerType: 'Solo',
          wouldRecommend: true,
        });
      }
      const duration = Math.round(performance.now() - start);
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        durationMs: duration,
        data: res.data,
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setTestResult({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Network Error',
        durationMs: duration,
        data: err.response?.data || null,
        error: err.message || 'Failed to connect to backend',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sample code snippets for Spring Boot files viewer
  const fileSnippets: Record<string, { lang: string; path: string; code: string }> = {
    'SecurityConfig.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/tripnest/config/SecurityConfig.java',
      code: `@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/destinations/**", "/api/reviews/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`,
    },
    'ReviewController.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/tripnest/controller/ReviewController.java',
      code: `@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReviewDto.ReviewListResponse>> getReviews(
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false, defaultValue = "recent") String sortBy
    ) {
        ReviewDto.ReviewListResponse res = reviewService.getReviews("destination", targetId, rating, null, sortBy);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody ReviewDto.CreateReviewRequest req,
            Authentication auth
    ) {
        String email = auth != null ? auth.getName() : "lara@tripnest.com";
        Review created = reviewService.createReview(req, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Review posted", created));
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<ApiResponse<Review>> voteHelpful(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Marked helpful", reviewService.voteHelpful(id)));
    }
}`,
    },
    'JwtAuthenticationFilter.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/tripnest/config/JwtAuthenticationFilter.java',
      code: `@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}`,
    },
    'OAuth2AuthenticationSuccessHandler.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/tripnest/config/OAuth2AuthenticationSuccessHandler.java',
      code: `@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("\${tripnest.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res, Authentication auth) 
            throws IOException {
        OAuth2User oauthUser = (OAuth2User) auth.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            return userRepository.save(User.builder()
                .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                .fullName(name)
                .email(email)
                .provider("GOOGLE")
                .role(Role.TRAVELER)
                .build());
        });

        String token = jwtService.generateToken(user);
        getRedirectStrategy().sendRedirect(req, res, frontendUrl + "?token=" + token);
    }
}`,
    },
    'application.yml': {
      lang: 'yaml',
      path: 'backend/src/main/resources/application.yml',
      code: `server:
  port: 8080

spring:
  application:
    name: tripnest-api
  datasource:
    url: \${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/tripnest}
    username: \${SPRING_DATASOURCE_USERNAME:tripnest}
    password: \${SPRING_DATASOURCE_PASSWORD:tripnest_secure_2026}
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: \${GOOGLE_CLIENT_ID}
            client-secret: \${GOOGLE_CLIENT_SECRET}
            scope: [openid, profile, email]

tripnest:
  jwt:
    secret: tripnestSecureJwtSecretKeyMustBeAtLeast256BitsLongForHmacSha256Security2026
    expiration-ms: 86400000`,
    },
    'docker-compose.yml': {
      lang: 'yaml',
      path: 'backend/docker-compose.yml',
      code: `version: '3.8'

services:
  tripnest-db:
    image: postgres:16-alpine
    container_name: tripnest-postgres
    environment:
      POSTGRES_DB: tripnest
      POSTGRES_USER: tripnest
      POSTGRES_PASSWORD: tripnest_secure_2026
    ports:
      - "5432:5432"
    volumes:
      - tripnest-data:/var/lib/postgresql/data
      - ./src/main/resources/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql

  tripnest-backend:
    build: .
    container_name: tripnest-api
    depends_on:
      - tripnest-db
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://tripnest-db:5432/tripnest

volumes:
  tripnest-data:`,
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Spring Boot 3.3.4 + Java 21 LTS
              </span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                PostgreSQL • tripnest
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Full-Stack Architecture & Spring Boot Backend
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              TripNest is structured with a modular 3-tier decoupled architecture: React + Vite + Tailwind CSS frontend communicating via <strong>REST / Axios</strong> with a Spring Boot Java 21 API powered by Spring Security, stateless JWT, Google OAuth2, and PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/download-zip"
              download="tripnest-full-project.zip"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Project (.ZIP)</span>
            </a>
            <a
              href="#axios-tester"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Test Axios Endpoints</span>
            </a>
            <a
              href="#code-viewer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspect Source Files</span>
            </a>
          </div>
        </div>
      </div>

      {/* Direct Download & Local Setup Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Ready-to-Run Project Package (4.1 MB ZIP)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                React 18 + Spring Boot 3.3 + Java 21 + PostgreSQL
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Contains the complete codebase: full React Vite client, Spring Boot backend with Spring Security, JWT filters, Google OAuth client, JPA entities, REST controllers, PostgreSQL <code className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded text-[11px]">schema.sql</code>, and <code className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded text-[11px]">docker-compose.yml</code>.
            </p>
          </div>
        </div>
        <a
          href="/api/download-zip"
          download="tripnest-full-project.zip"
          className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download ZIP Archive</span>
        </a>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              System Architecture Flowchart
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Decoupled Microservice Contract</span>
        </div>

        {/* Responsive Grid Flowchart matching the requested diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* Box 1: TripNest UI */}
          <div className="rounded-xl border-2 border-indigo-500/30 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Frontend Tier
              </span>
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">TripNest UI</h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>React 19 + TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Vite Lightning Dev Server</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tailwind CSS Modern Styling</span>
              </li>
            </ul>
          </div>

          {/* Connector 1: REST / Axios */}
          <div className="hidden lg:flex absolute left-1/3 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 flex-col items-center">
            <div className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1 text-[11px] font-mono font-bold shadow-md flex items-center gap-1.5">
              <span>REST / Axios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Box 2: Spring Boot API */}
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50/50 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Backend API Tier
              </span>
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spring Boot API</h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Java 21 LTS Runtime</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Spring Security 6 (Stateless)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>HMAC-SHA256 JWT + OAuth2 Client</span>
              </li>
            </ul>
          </div>

          {/* Box 3: Data & Identity Tier */}
          <div className="space-y-4">
            {/* PostgreSQL Box */}
            <div className="rounded-xl border-2 border-cyan-500/30 bg-cyan-50/50 p-4 dark:border-cyan-500/20 dark:bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Relational Storage
                </span>
                <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">PostgreSQL (tripnest)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Port 5432 • Trips, Itineraries, Expenses, Reviews, Destinations tables.
              </p>
            </div>

            {/* Google OAuth Box */}
            <div className="rounded-xl border-2 border-amber-500/30 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Identity Provider
                </span>
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Google OAuth Login</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                OAuth 2.0 Web Client with automatic JWT generation on redirect.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Target & Connection Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Active Axios Base URL Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select whether frontend Axios calls communicate with the container's built-in REST proxy or your local Spring Boot instance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchBackend('/api')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeBaseUrl === '/api'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Dev Proxy (/api)
            </button>
            <button
              onClick={() => handleSwitchBackend('http://localhost:8080/api')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeBaseUrl === 'http://localhost:8080/api'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Spring Boot (localhost:8080)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="text"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="Custom API URL (e.g. http://localhost:8080/api)"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            onClick={() => handleSwitchBackend(customUrlInput)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      </div>

      {/* Interactive Axios Live Endpoint Tester */}
      <div
        id="axios-tester"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Live Axios REST Endpoint Tester
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Trigger real-time HTTP requests through the configured Axios client instance with automatic JWT Authorization header injection.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTestEndpoint('/reviews');
                setTestMethod('GET');
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
            >
              GET /reviews
            </button>
            <button
              onClick={() => {
                setTestEndpoint('/destinations');
                setTestMethod('GET');
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
            >
              GET /destinations
            </button>
            <button
              onClick={() => {
                setTestEndpoint('/trips');
                setTestMethod('GET');
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
            >
              GET /trips
            </button>
            <button
              onClick={() => {
                setTestEndpoint('/reviews');
                setTestMethod('POST');
              }}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-mono text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:text-slate-300 cursor-pointer"
            >
              POST /reviews
            </button>
          </div>
        </div>

        {/* Input & Run bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={testMethod}
            onChange={(e) => setTestMethod(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs">
            <span className="text-slate-400">{activeBaseUrl}</span>
            <input
              type="text"
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="w-full bg-transparent px-1 py-2 text-slate-900 focus:outline-hidden dark:text-white"
            />
          </div>
          <button
            onClick={handleRunAxiosTest}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isTesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>Execute Request</span>
          </button>
        </div>

        {/* Test Result Inspector */}
        {testResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 font-mono text-xs space-y-3 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    testResult.status && testResult.status < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Status: {testResult.status} {testResult.statusText}
                </span>
                <span className="text-slate-400 text-[11px]">Latency: {testResult.durationMs}ms</span>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(testResult.data, null, 2))}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Response'}</span>
              </button>
            </div>
            <pre className="max-h-64 overflow-y-auto text-slate-300 text-[11px] leading-relaxed scrollbar-thin">
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Spring Boot Codebase Viewer */}
      <div
        id="code-viewer"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Spring Boot Java 21 Codebase Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Production source files located under <code className="font-mono text-indigo-600 dark:text-indigo-400">/backend</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(fileSnippets[selectedFile]?.code || '')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Tab navigation for code files */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
          {Object.keys(fileSnippets).map((filename) => (
            <button
              key={filename}
              onClick={() => setSelectedFile(filename)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedFile === filename
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {filename}
            </button>
          ))}
        </div>

        {/* File Path indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>{fileSnippets[selectedFile]?.path}</span>
        </div>

        {/* Code Content display */}
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 shadow-inner overflow-x-auto border border-slate-800 max-h-96">
          <pre className="leading-relaxed whitespace-pre font-mono text-[12px]">
            {fileSnippets[selectedFile]?.code}
          </pre>
        </div>
      </div>

      {/* Quickstart Guide Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          How to Run Spring Boot Locally with PostgreSQL
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white">Option A: Docker Compose (1-Click)</span>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <code>cd backend<br />docker compose up --build</code>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Automatically starts PostgreSQL (`tripnest`) and Spring Boot API on port 8080.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white">Option B: Maven + Local Java 21</span>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <code>cd backend<br />mvn spring-boot:run</code>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Runs the Spring Boot application directly on your local Java 21 LTS runtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
