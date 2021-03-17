package de.kettcards.web2print.model.db;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Data
@Entity
@Table(name = "user")
public class UserCredentials {

    @Id
    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;
}
