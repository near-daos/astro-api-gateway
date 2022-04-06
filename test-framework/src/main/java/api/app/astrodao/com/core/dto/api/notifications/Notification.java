package api.app.astrodao.com.core.dto.api.notifications;

import api.app.astrodao.com.openapi.models.Dao;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class Notification {
    private Boolean isArchived;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String id;
    private String daoId;
    private Dao dao;
    private String targetId;
    private String signerId;
    private JsonNode type;
    private JsonNode status;
    private JsonNode metadata;
    private BigDecimal timestamp;
}
