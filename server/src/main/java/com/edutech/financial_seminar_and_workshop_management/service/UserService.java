 package com.edutech.financial_seminar_and_workshop_management.service;

 import org.springframework.beans.factory.annotation.Autowired;
 import org.springframework.context.annotation.Lazy;
 import org.springframework.security.authentication.AuthenticationManager;
 import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
 import org.springframework.security.core.authority.AuthorityUtils;
 import org.springframework.security.core.userdetails.UserDetails;
 import org.springframework.security.core.userdetails.UserDetailsService;
 import org.springframework.security.core.userdetails.UsernameNotFoundException;
 import org.springframework.security.crypto.password.PasswordEncoder;
 import org.springframework.stereotype.Service;
 import com.edutech.financial_seminar_and_workshop_management.dto.LoginResponse;
 import com.edutech.financial_seminar_and_workshop_management.entity.User;
 import com.edutech.financial_seminar_and_workshop_management.jwt.JwtUtil;
 import com.edutech.financial_seminar_and_workshop_management.repository.UserRepository;
 import java.util.List;

 @Service
 public class UserService implements UserDetailsService {

     @Autowired
     private UserRepository userRepository;

     @Autowired
     private PasswordEncoder passwordEncoder;

     @Lazy
     @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
     private JwtUtil jwtUtil;

     @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
         User user = userRepository.findByUsername(username);
         if (user == null) throw new UsernameNotFoundException("User not found: " + username);
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                 user.getPassword(),
                AuthorityUtils.createAuthorityList(user.getRole())
         );
     }
public User registerUser(User user) {

    if (user.getRole() == null) {
        throw new RuntimeException("Role is required");
    }

    // ✅ allow only valid roles
    if (!List.of("PARTICIPANT", "INSTITUTION", "PROFESSIONAL")
            .contains(user.getRole())) {
        throw new RuntimeException("Invalid role");
    }

    // ✅ DO NOT override role
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    return userRepository.save(user);
}


     public LoginResponse loginUser(String username, String password) {
         authenticationManager.authenticate(
                 new UsernamePasswordAuthenticationToken(username, password)
         );
         User user = userRepository.findByUsername(username);
         String token = jwtUtil.generateToken(loadUserByUsername(username));
         return new LoginResponse(token, user.getUsername(), user.getRole(), user.getId());
     }

     public List<User> getAllUsers() {
         return userRepository.findAll();
     }

     public User getUserById(Long id) {
         return userRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("User not found: " + id));
     }

     public List<User> getUsersByRole(String role) {
         return userRepository.findByRole(role);
    }

 }