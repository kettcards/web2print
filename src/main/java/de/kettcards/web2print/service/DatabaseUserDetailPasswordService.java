package de.kettcards.web2print.service;

import de.kettcards.web2print.model.db.UserCredentials;
import de.kettcards.web2print.repository.UserCredentialsRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsPasswordService;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailPasswordService implements UserDetailsPasswordService {

    private final UserCredentialsRepository userCredentialsRepository;

    private final UserDetailsMapper userDetailsMapper;

    public DatabaseUserDetailPasswordService(UserCredentialsRepository userCredentialsRepository, UserDetailsMapper userDetailsMapper) {
        this.userCredentialsRepository = userCredentialsRepository;
        this.userDetailsMapper = userDetailsMapper;
    }

    @Override
    public UserDetails updatePassword(UserDetails user, String newPassword) {
        //if username doesn't have a corresponding entry it should already stop at username check
        UserCredentials userCredentials = userCredentialsRepository.findByUsername(user.getUsername()).get();
        userCredentials.setPassword(newPassword);
        return userDetailsMapper.toUserDetails(userCredentials);
    }
}
