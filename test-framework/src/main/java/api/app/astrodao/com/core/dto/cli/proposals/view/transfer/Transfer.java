package api.app.astrodao.com.core.dto.cli.proposals.view.transfer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Transfer {
    @JsonProperty("token_id")
    private String tokenId;
    @JsonProperty("receiver_id")
    private String receiverId;
    private String amount;
    public Object msg;
}
