package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "motive")
public class Motive implements Serializable {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Integer id;

    @Column(name = "textureSlug")
    private String textureSlug;

}
