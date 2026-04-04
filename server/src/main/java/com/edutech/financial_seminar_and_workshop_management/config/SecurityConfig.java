package com.edutech.financial_seminar_and_workshop_management.config;

import com.edutech.financial_seminar_and_workshop_management.jwt.JwtRequestFilter;
import com.edutech.financial_seminar_and_workshop_management.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Lazy
    @Autowired private UserService userService;

    @Autowired private JwtRequestFilter jwtRequestFilter;

    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(passwordEncoder);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http.cors().and().csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()

                /* ================= PUBLIC ================= */
                .antMatchers(
                        "/api/user/register",
                        "/api/user/login",
                        "/api/user/forgot-password",
                        "/api/user/reset-password",
                        "/api/user/forgot-password-otp",
                        "/api/user/reset-password-otp"
                ).permitAll()

                /* ================= INSTITUTION ================= */
                .antMatchers(HttpMethod.POST,   "/api/institution/event").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.PUT,    "/api/institution/event/*").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.DELETE, "/api/institution/event/*").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.GET,    "/api/institution/events").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.POST,   "/api/institution/event/*/resource").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.GET,    "/api/institution/event/professionals").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.POST,   "/api/institution/event/*/professional").hasAuthority("INSTITUTION")
                .antMatchers(HttpMethod.GET,    "/api/institution/event/*/feedbacks").hasAuthority("INSTITUTION")

                /* ================= PROFESSIONAL ================= */
                .antMatchers(HttpMethod.GET,  "/api/professional/events").hasAuthority("PROFESSIONAL")
                .antMatchers(HttpMethod.PUT,  "/api/professional/event/*/assignment").hasAuthority("PROFESSIONAL")
                .antMatchers(HttpMethod.PUT,  "/api/professional/event/*/status").hasAuthority("PROFESSIONAL")
                .antMatchers(HttpMethod.POST, "/api/professional/event/*/feedback").hasAuthority("PROFESSIONAL")

                /* ================= PARTICIPANT ================= */
                .antMatchers(HttpMethod.GET,  "/api/participant/events").hasAuthority("PARTICIPANT")
                .antMatchers(HttpMethod.POST, "/api/participant/event/*/enroll").hasAuthority("PARTICIPANT")
                .antMatchers(HttpMethod.GET,  "/api/participant/event/*/status").hasAuthority("PARTICIPANT")
                .antMatchers(HttpMethod.POST, "/api/participant/event/*/feedback").hasAuthority("PARTICIPANT")

                /* ================= STRONG END GUARDS ================= */
                .antMatchers("/api/institution/**").hasAuthority("INSTITUTION")
                .antMatchers("/api/professional/**").hasAuthority("PROFESSIONAL")
                .antMatchers("/api/participant/**").hasAuthority("PARTICIPANT")

                .anyRequest().authenticated()

            .and()
                .exceptionHandling()
                .authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(401);
                    res.getWriter().write("Unauthorized");
                })
                .accessDeniedHandler((req, res, ex) -> {
                    res.setStatus(403);
                    res.getWriter().write("Forbidden: wrong role");
                });

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}