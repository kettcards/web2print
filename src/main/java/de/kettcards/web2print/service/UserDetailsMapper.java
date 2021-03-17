package de.kettcards.web2print.service;


import de.kettcards.web2print.model.db.UserCredentials;
import de.kettcards.web2print.security.Roles;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
class UserDetailsMapper {

    UserDetails toUserDetails(UserCredentials userCredentials) {

        return User.withUsername(userCredentials.getUsername())
                .password(userCredentials.getPassword())
                //TODO: use role system with database and not just assume role admin for every user
                .roles(Roles.ADMIN.name())
                .build();
    }
}