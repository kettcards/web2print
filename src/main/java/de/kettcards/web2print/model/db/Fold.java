package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "fold")
public class Fold implements Serializable {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "card_id")
    private Integer cardId;

    @Column(name = "x1")
    private Integer x1;

    @Column(name = "y1")
    private Integer y1;

    @Column(name = "x2")
    private Integer x2;

    @Column(name = "y2")
    private Integer y2;

    @Column(name = "angle")
    private Integer angle;

}
