package de.kettcards.web2print.model.db.rel;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Geometry;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "geometry_map")
public class GeometryMap implements Serializable {

    @JsonIgnore
    @EmbeddedId
    GeometryMapId geometryMapId;

    @JsonIgnore
    @ManyToOne
    @MapsId("card")
    private Card card;

    @JsonUnwrapped
    @ManyToOne
    @MapsId("geometry")
    private Geometry geometry;

    @Column(name = "side")
    private String side;

    @Data
    @Embeddable
    public static class GeometryMapId implements Serializable {

        private Integer card;

        private Integer geometry;

    }
}
