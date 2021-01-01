package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "geometry")
public class Geometry implements Serializable {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Integer id;

    @Column(name = "cut")
    private Integer cut;

    @Column(name = "name")
    private String name;

    @Column(name = "geometry")
    private String geometry;

}
