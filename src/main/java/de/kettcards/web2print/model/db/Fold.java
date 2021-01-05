package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Data
@Entity
@Table(name = "fold")
public class Fold implements Serializable, VirtualId {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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

    @Override
    public int getVirtualId() {
        return id;
    }

    @Override
    public int getVirtualHash() {
        return Objects.hash(x1, y1, x2, x2, angle);
    }

    //known types //TODO unused, incomplete implementation
    public enum Type {

        SIMPLE_VERTICAL("links"),
        SIMPLE_HORIZONTAL("oben");

        private final String value;

        Type(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public Type forName(String value) throws IllegalArgumentException {
            switch (value) {
                case "links":
                    return Type.SIMPLE_VERTICAL;
                case "oben":
                    return Type.SIMPLE_HORIZONTAL;
                default:
                    throw new IllegalArgumentException(value);
            }
        }
    }

}
