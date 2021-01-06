package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import de.kettcards.web2print.model.db.rel.GeometryMap;
import de.kettcards.web2print.model.db.rel.MotiveMap;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Data
@Entity
@Table(name = "card")
public class Card implements Serializable, VirtualId {

    @JsonIgnore
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "thumbSlug")
    private String thumbSlug;

    //@Column(name = "printType") //TODO impl
    //private PrintType printType;

    @Column(name = "name")
    private String name;

    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "aspectRatio_id")
    private AspectRatio aspectRatio;

    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToMany
    @JoinTable(name = "fold_map", joinColumns = { @JoinColumn(name = "card_id") }, inverseJoinColumns = { @JoinColumn(name = "fold_id") })
    private List<Fold> folds;

    @JsonProperty("geometry")
    @OneToMany(mappedBy = "card")
    private List<GeometryMap> geometryMaps;

    @JsonProperty("motive")
    @OneToMany(mappedBy = "card")
    private List<MotiveMap> motiveMaps;


    @Override
    public int getVirtualId() {
        return id;
    }

    @Override
    public int getVirtualHash() {
        return orderId.hashCode();
    }

    public enum Side {
        FRONT, BACK
    }

    public static class SideConverter implements AttributeConverter<Side, Integer> {

        @Override
        public Integer convertToDatabaseColumn(Side attribute) {
            return null; //TODO impl
        }

        @Override
        public Side convertToEntityAttribute(Integer dbData) {
            return null; //TODO impl
        }
    }

}