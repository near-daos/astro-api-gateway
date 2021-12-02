package api.app.astrodao.com.core.dto.cli.proposals.view.bounty;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.HashMap;

@Data
public class ViewAddBountyProposal {
    public Integer id;
    public String proposer;
    public String description;
    public Kind kind;
    public String status;
    @JsonProperty("vote_counts")
    private HashMap voteCounts;
    private HashMap votes;
    @JsonProperty("submission_time")
    public String submissionTime;
}
