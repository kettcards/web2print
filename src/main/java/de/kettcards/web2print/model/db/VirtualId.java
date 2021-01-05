package de.kettcards.web2print.model.db;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * indicates that object has unique identifier which can differ from primary key
 * used for object transformation
 */
public interface VirtualId {

    @JsonIgnore
    int getVirtualId();

    @JsonIgnore
    int getVirtualHash();

    @JsonIgnore
    default boolean isVirtuallyEqual(Object object) {
        if (object instanceof VirtualId) {
            try {
                return ((VirtualId) object).getVirtualHash() == this.getVirtualHash();
            } catch (NullPointerException ex) {
                return false;
            }
        }
        return false;
    };

}
