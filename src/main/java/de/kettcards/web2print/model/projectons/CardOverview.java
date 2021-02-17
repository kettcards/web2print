package de.kettcards.web2print.model.projectons;

import de.kettcards.web2print.model.db.VirtualId;
import lombok.Value;

@Value
public final class CardOverview implements VirtualId {

    private String name, orderId, thumbSlug;

    @Override
    public int getVirtualId() {
        throw new UnsupportedOperationException();
    }

    @Override
    public int getVirtualHash() {
        return orderId.hashCode();
    }
}
