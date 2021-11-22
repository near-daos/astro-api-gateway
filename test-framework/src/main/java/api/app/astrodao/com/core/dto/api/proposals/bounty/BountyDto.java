package api.app.astrodao.com.core.dto.api.proposals.bounty;

import api.app.astrodao.com.core.dto.api.proposals.Dao;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BountyDto {
    @JsonProperty("createdAt")
    public String createdAt;
    @JsonProperty("transactionHash")
    public Object transactionHash;
    @JsonProperty("updateTransactionHash")
    public Object updateTransactionHash;
    @JsonProperty("createTimestamp")
    public Object createTimestamp;
    @JsonProperty("updateTimestamp")
    public Object updateTimestamp;
    @JsonProperty("id")
    public String id;
    @JsonProperty("bountyId")
    public Integer bountyId;
    @JsonProperty("daoId")
    public String daoId;
    @JsonProperty("description")
    public String description;
    @JsonProperty("token")
    public String token;
    @JsonProperty("amount")
    public String amount;
    @JsonProperty("times")
    public String times;
    @JsonProperty("maxDeadline")
    public String maxDeadline;
    @JsonProperty("numberOfClaims")
    public Integer numberOfClaims;
    @JsonProperty("dao")
    public Dao dao;
}
