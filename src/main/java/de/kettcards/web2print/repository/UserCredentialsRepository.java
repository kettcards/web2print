package de.kettcards.web2print.repository;

import de.kettcards.web2print.model.db.UserCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCredentialsRepository extends JpaRepository <UserCredentials, String> {

    Optional<UserCredentials> findByUsername(String username);
}
