package de.kettcards.web2print.model.db.rel;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import de.kettcards.web2print.model.db.Card;
import de.kettcards.web2print.model.db.Motive;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Data
@Entity
@Table(name = "motive_map")
public final class MotiveMap implements Serializable {

    @JsonIgnore
    @EmbeddedId
    private MotiveMapId motiveMapId;

    @JsonIgnore
    @ManyToOne
    @MapsId("card")
    private Card card;

    @JsonUnwrapped
    @ManyToOne
    @MapsId("motive")
    private Motive motive;

    @Column(name = "side")
    private String side;

    //Overwritten because of StackOverflowError
    @Override
    public String toString() {
        return super.toString();
    }

    @Data
    @Embeddable
    public final static class MotiveMapId implements Serializable {

        private Integer card;

        private Integer motive;

    }

}
