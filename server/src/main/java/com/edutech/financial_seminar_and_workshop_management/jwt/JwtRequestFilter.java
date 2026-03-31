 package com.edutech.financial_seminar_and_workshop_management.jwt;

 import io.jsonwebtoken.ExpiredJwtException;
 import io.jsonwebtoken.MalformedJwtException;
 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.context.annotation.Lazy;
 import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
 import org.springframework.security.core.authority.AuthorityUtils;
 import org.springframework.security.core.context.SecurityContextHolder;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.security.core.userdetails.UserDetailsService;
 import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
 import org.springframework.stereotype.Component;
 import org.springframework.web.filter.OncePerRequestFilter;

 import javax.servlet.FilterChain;
 import javax.servlet.ServletException;
 import javax.servlet.http.HttpServletRequest;
 import javax.servlet.http.HttpServletResponse;
 import java.io.IOException;

 @Component
 public class JwtRequestFilter extends OncePerRequestFilter {

     @Lazy
     @Autowired
     private UserDetailsService userDetailsService;

    @Autowired
     private JwtUtil jwtUtil;

     @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
         String username = null;
         String jwt = null;

         if (authHeader != null && authHeader.startsWith("Bearer ")) {
             jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
             } catch (ExpiredJwtException e) {
                logger.warn("JWT token is expired: " + e.getMessage());
             } catch (MalformedJwtException e) {
                 logger.warn("JWT token is malformed: " + e.getMessage());
             } catch (Exception e) {
                 logger.warn("Unable to parse JWT token: " + e.getMessage());
             }
         }

         if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                String role = jwtUtil.extractRole(jwt);
                UsernamePasswordAuthenticationToken authToken =
                         new UsernamePasswordAuthenticationToken(
                                 userDetails,
                                 null,
                                 AuthorityUtils.createAuthorityList(role)
                         );
                 authToken.setDetails(
                       new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
             }
        }
       filterChain.doFilter(request, response);
     }
 }