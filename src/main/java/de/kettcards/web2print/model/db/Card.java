package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import de.kettcards.web2print.model.db.rel.GeometryMap;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;

@Data
@Entity
@Table(name = "card")
public final class Card implements Serializable, VirtualId {

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
    @JoinColumn(name = "cardFormat_id")
    private CardFormat cardFormat;

    @JsonManagedReference
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Texture texture;

    @JsonProperty("geometry")
    @OneToMany(mappedBy = "card")
    private List<GeometryMap> geometryMaps;

    @JsonProperty("front")
    @JoinColumn(name = "frontMotive")
    private Motive frontMotive;

    @JsonProperty("back")
    @JoinColumn(name = "backMotive")
    private Motive backMotive;

    /*
    @JsonGetter
    public List<MotiveMap> getMotiveMaps() {
        if (motiveMaps == null || motiveMaps.isEmpty()) {
            var list = new LinkedList<MotiveMap>();
            if (cardFormat.getDefaultFrontMotive() != null) {
                MotiveMap motiveMap = new MotiveMap();
                motiveMap.setCard(this);
                motiveMap.setSide("FRONT");
                motiveMap.setMotive(cardFormat.getDefaultFrontMotive());
                list.add(motiveMap);
            }
            if (cardFormat.getDefaultFrontMotive() != null) {
                MotiveMap motiveMap = new MotiveMap();
                motiveMap.setCard(this);
                motiveMap.setSide("BACK");
                motiveMap.setMotive(cardFormat.getDefaultBackMotive());
                list.add(motiveMap);
            }
            return list;
        }
        return motiveMaps;
    }

     */

    @Override
    public int getVirtualId() {
        return id;
    }

    @Override
    public int getVirtualHash() {
        return orderId.hashCode();
    }

    @Override
    public int hashCode() {
        return orderId.hashCode();
    }

}
