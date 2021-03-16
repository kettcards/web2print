package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.UserCredentials;
import de.kettcards.web2print.repository.UserCredentialsRepository;
import de.kettcards.web2print.security.Roles;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserCredentialsRepository userCredentialsRepository;

    public DatabaseUserDetailsService(UserCredentialsRepository userCredentialsRepository) {
        this.userCredentialsRepository = userCredentialsRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserCredentials userCredentials = userCredentialsRepository.findByUsername(username);
        return User.withUsername(userCredentials.getUsername())
                .password(userCredentials.getPassword())
                .roles(Roles.ADMIN.name())
                .build();
    }

}
