package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.UserCredentials;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCredentialsRepository {

    UserCredentials findByUsername(String username);
}
