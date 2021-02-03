package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Data
@Entity
@Table(name = "card_format")
public class CardFormat implements Serializable, VirtualId {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "name")
    private String name;

    @JsonIgnore
    @Column(name = "defaultFrontMotive")
    private Motive defaultFrontMotive;

    @JsonIgnore
    @Column(name = "defaultBackMotive")
    private Motive defaultBackMotive;

    @OneToMany(mappedBy = "id")
    private List<Fold> folds;

    @Override
    public int getVirtualHash() {
        return Objects.hash(width, height, name);
    }

    @Override
    public int getVirtualId() {
        return id;
    }


    //custom to String because lombok toString causes recursion problem
    @Override
    public String toString() {
        return "CardFormat = [ id = " + id + " width = " + width + " height = " +
                height + " name = " + name + " ]";
    }

}
