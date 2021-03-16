package de.kettcards.web2print.model.db;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "user")
public class UserCredentials {

    @Id
    private String username;

    private String password;
}
