package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import de.kettcards.web2print.service.ImportService;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Data
@Entity
@Table(name = "aspect_ratio")
public class AspectRatio implements Serializable, VirtualId {

    @JsonIgnore
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

    @JsonBackReference
    @OneToMany(mappedBy = "material")
    private List<Card> aspectRatio;

    @Override
    public int getVirtualHash() {
        return Objects.hash(width, height, name);
    }

    @Override
    public int getVirtualId() {
        return id;
    }
}
