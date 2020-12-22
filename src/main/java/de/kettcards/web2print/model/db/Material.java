package de.kettcards.web2print.model.db;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Data
@Entity
@Table(name = "material")
public class Material implements Serializable {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue
    private Integer id;

    @JsonBackReference
    @OneToMany(mappedBy = "material")
    private List<Card> card;

    @Column(name = "name")
    private String name;

    @Column(name = "textureSlug")
    private String textureSlug;

    @Convert(converter = TilingConverter.class)
    @Column(name = "tiling")
    private Tiling tiling;

    enum Tiling {
        STRETCH, REPEAT
    }

    public static class TilingConverter implements AttributeConverter<Tiling, String> {

        @Override
        public String convertToDatabaseColumn(Tiling attribute) {
            return null;
        }

        @Override
        public Tiling convertToEntityAttribute(String dbData) {
            switch (dbData) {
                case "stretch":
                    return Tiling.STRETCH;
                case "repeat":
                    return Tiling.REPEAT;
                default:
                    return null;
            }
        }
    }

}
