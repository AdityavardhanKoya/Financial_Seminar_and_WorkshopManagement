 package com.edutech.financial_seminar_and_workshop_management.config;

 import org.springframework.context.annotation.Bean;
 import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.security.authentication.AuthenticationManager;
 import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
 import org.springframework.security.config.annotation.web.builders.HttpSecurity;
 import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
 import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
 import org.springframework.security.config.http.SessionCreationPolicy;
 import org.springframework.security.crypto.password.PasswordEncoder;
 import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
 import com.edutech.financial_seminar_and_workshop_management.jwt.JwtRequestFilter;
import com.edutech.financial_seminar_and_workshop_management.service.UserService;

@Configuration
 @EnableWebSecurity
 public class SecurityConfig extends WebSecurityConfigurerAdapter {

     @Lazy
     @Autowired
     private UserService userService;

     @Autowired
     private JwtRequestFilter jwtRequestFilter;

     @Autowired
     private PasswordEncoder passwordEncoder;

     @Override
     protected void configure(AuthenticationManagerBuilder auth) throws Exception {
         auth.userDetailsService(userService)
             .passwordEncoder(passwordEncoder);
     }

    @Bean
     @Override
     public AuthenticationManager authenticationManagerBean() throws Exception {
         return super.authenticationManagerBean();
     }

    @Override
     protected void configure(HttpSecurity http) throws Exception {
         http.csrf().disable()
             .authorizeRequests()
                .antMatchers("/api/user/register", "/api/user/login").permitAll()
                .antMatchers("/api/events").permitAll()   
                 .antMatchers("/api/institution/event").hasAuthority("INSTITUTION")
                 .antMatchers("/api/institution/event/{id}").hasAuthority("INSTITUTION")
                 .antMatchers("/api/institution/events").hasAuthority("INSTITUTION")
                 .antMatchers("/api/institution/event/{eventId}/resource").hasAuthority("INSTITUTION")
                 .antMatchers("/api/institution/event/professionals").hasAuthority("INSTITUTION")
                 .antMatchers("/api/institution/event/{eventId}/professional").hasAuthority("INSTITUTION")
                 .antMatchers("/api/professional/events").hasAuthority("PROFESSIONAL")
                 .antMatchers("/api/professional/event/{id}/status").hasAuthority("PROFESSIONAL")
                 .antMatchers("/api/professional/event/{eventId}/feedback").hasAuthority("PROFESSIONAL")
                .antMatchers("/api/participant/events").hasAuthority("PARTICIPANT")
                 .antMatchers("/api/participant/event/{eventId}/enroll").hasAuthority("PARTICIPANT")
                 .antMatchers("/api/participant/event/{id}/status").hasAuthority("PARTICIPANT")
                 .antMatchers("/api/participant/event/{eventId}/feedback").hasAuthority("PARTICIPANT")
                 .anyRequest().authenticated()
             .and()
             .sessionManagement()
                 .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

         http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
 }