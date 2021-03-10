package de.kettcards.web2print.model.db;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "material")
public final class Material implements Serializable, VirtualId {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    //@JsonBackReference
    //@OneToMany(mappedBy = "material")
    //private List<Card> card;

    @Column(name = "name")
    private String name;

    @Column(name = "textureSlug")
    private String textureSlug;

    //@Convert(converter = TilingConverter.class)
    @Column(name = "tiling")
    private String tiling;

    @Override
    public int getVirtualId() {
        return id;
    }

    @Override
    public int getVirtualHash() {
        return name.hashCode();
    }

}
