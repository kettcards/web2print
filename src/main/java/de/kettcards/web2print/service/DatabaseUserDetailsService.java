package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.UserCredentials;
import de.kettcards.web2print.repository.UserCredentialsRepository;
import de.kettcards.web2print.security.Roles;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserCredentialsRepository userCredentialsRepository;

    public DatabaseUserDetailsService(UserCredentialsRepository userCredentialsRepository) {
        this.userCredentialsRepository = userCredentialsRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        //fake user exists so instead of throwing an exception which doesn't get to the user the user gets "bad credentials"
        //when sending a non existing username
        UserCredentials fakeUser = new UserCredentials();
        fakeUser.setUsername(username);
        fakeUser.setPassword("");

        UserCredentials userCredentials = userCredentialsRepository.findByUsername(username)
                .orElse(fakeUser);
        return User.withUsername(userCredentials.getUsername())
                .password(userCredentials.getPassword())
                //TODO: use role system with database and not just assume role admin for every user
                .roles(Roles.ADMIN.name())
                .build();
    }

}
