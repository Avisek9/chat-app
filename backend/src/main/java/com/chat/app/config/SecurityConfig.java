package com.chat.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Use cookie-based CSRF so the React frontend can read the token
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(requestHandler)
                // Exclude WebSocket handshake from CSRF (SockJS handles its own)
                .ignoringRequestMatchers("/ws/**")
            )
            .authorizeHttpRequests(auth -> auth
                // Login/logout and static assets are open
                .requestMatchers("/api/auth/**", "/h2-console/**").permitAll()
                // Everything else needs a valid session
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((req, res, auth) -> {
                    res.setContentType("application/json");
                    res.getWriter().write("{\"username\":\"" + auth.getName() + "\",\"status\":\"ok\"}");
                })
                .failureHandler((req, res, ex) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"error\":\"Bad credentials\"}");
                })
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> {
                    res.setContentType("application/json");
                    res.getWriter().write("{\"status\":\"logged out\"}");
                })
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            // Allow H2 console frames (dev only)
            .headers(headers -> headers.frameOptions(f -> f.sameOrigin()))
            .sessionManagement(session -> session
                .maximumSessions(1)
            );

        return http.build();
    }
}
